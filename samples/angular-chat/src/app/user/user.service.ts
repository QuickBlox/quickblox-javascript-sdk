import {EventEmitter, Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {CanActivate, Router} from '@angular/router';
import {QBHelper} from '../helper/qbHelper';
import {QBconfig} from '../QBconfig';

declare var QB: any;

@Injectable()
export class UserService implements CanActivate {
  public errorSubject = new Subject<any>();
  public successSubject = new Subject<boolean>();
  public user: any;
  public _usersCache = [];
  usersCacheEvent: EventEmitter<any> = new EventEmitter();

  constructor(private qbHelper: QBHelper, private router: Router) {
  }

  canActivate(): boolean {
    const self = this;
    this.user = JSON.parse(localStorage.getItem('loggedinUser'));
    const sessionResponse = JSON.parse(localStorage.getItem('sessionResponse'));
    if (this.qbHelper.getSession() && this.user && sessionResponse) {
      return true;
    } else if (sessionResponse && this.user) {
      self.login({
        userLogin: this.user.login,
        userName: this.user.full_name,
      }).then(() => {
        this.router.navigate(['dashboard']);
      });
    } else {
      self.qbHelper.qbLogout();
    }
  }

  public addToCache(user: any) {
    const id = user.id;
    if (!this._usersCache[id]) {
      this._usersCache[id] = {
        id: id,
        color: Math.floor(Math.random() * (10 - 1 + 1)) + 1
      };
    }
    this._usersCache[id].last_request_at = user.last_request_at;
    this._usersCache[id].name = user.full_name || user.login || 'Unknown user (' + id + ')';
    this.usersCacheEvent.emit(this._usersCache);
    return this._usersCache[id];
  }

  // create User
  public createUser(user): Promise<any> {
    return new Promise((resolve, reject) => {
      QB.users.create(user, function (createErr, createRes) {
        if (createErr) {
          console.log('User creation Error : ', createErr);
          reject(createErr);
        } else {
          console.log('User Creation successfull ');
          resolve(createRes);
        }
      });
    });
  }

  // update User
  public updateUser(userId, params): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      QB.users.update(userId, params, function (updateError, updateUser) {
        if (updateError) {
          console.log('User update Error : ', updateError);
          reject(updateError);
        } else {
          self.addToCache(updateUser);
          console.log('User update successfull ', updateUser);
          resolve(updateUser);
        }
      });
    });
  }

  // get Users List
  public getUserList(args): Promise<any> {
    if (typeof args !== 'object') {
      args = {};
    }
    const
      self = this,
      params = {
        filter: {
          field: args.field || 'full_name',
          param: 'in',
          value: args.value || [args.full_name || '']
        },
        order: args.order || {
          field: 'updated_at',
          sort: 'desc'
        },
        page: args.page || 1,
        per_page: args.per_page || 100
      };
    return new Promise(function (resolve, reject) {
      QB.users.listUsers(params, function (userErr: any, usersRes: any) {
        if (userErr) {
          reject(userErr);
        } else {
          console.log('User List === ', usersRes);
          const users = usersRes.items.map((userObj: any) => {
            self.addToCache(userObj.user);
            return userObj.user;
          });
          resolve(users);
        }
      });
    });
  }

  public setUser(User) {
    this.user = User;
    localStorage.setItem('loggedinUser', JSON.stringify(User));
  }

  public login(loginPayload) {
    return new Promise((resolve, reject) => {
      QB.init(QBconfig.credentials.appId, QBconfig.credentials.authKey, QBconfig.credentials.authSecret, QBconfig.appConfig);
      const user = {
        login: loginPayload.userLogin,
        password: 'quickblox',
        full_name: loginPayload.userName
      };
      const loginSuccess = (loginRes) => {
        console.log('login Response :', loginRes);
        this.setUser(loginRes);
        console.log('chat connection :', loginRes.id, user.password);
        // Establish chat connection
        this.qbHelper.qbChatConnection(loginRes.id, user.password).then(chatRes => {
            this.successSubject.next(true);
            resolve();
          },
          chatErr => {
            console.log('chat connection Error :', chatErr);
          });
      };

      const loginError = (error) => {
        const message = Object.keys(error.detail).map(function (key) {
          return key + ' ' + error.detail[key].join('');
        });
        alert(message);
      };

      console.log('User : ', user);
      this.qbHelper.qbCreateConnection(user)
        .then((loginRes) => {
          /** Update info */
          if (loginRes.full_name !== user.full_name) {
            this.updateUser(loginRes.id, {
              'full_name': user.full_name
            }).then(updateUser => {
              loginSuccess(updateUser);
            });
          } else {
            loginSuccess(loginRes);
          }
        })
        .catch((loginErr) => {
          if (loginErr.status === undefined || loginErr.status !== 401) {
            /** Login failed, trying to create account */
            this.createUser(user).then(createRes => {
              console.log('create user success :', createRes);
              // Relogin
              this.qbHelper.qbCreateConnection(user).then(reLoginRes => {
                loginSuccess(reLoginRes);
              });
            }).catch(createErr => {
              loginError(createErr);
            });
          }
        });
    });
  }

  public getRecipientUserId(users) {
    const self = this;
    if (users.length === 2) {
      return users.filter(function (user) {
        if (user !== self.user.id) {
          return user;
        }
      })[0];
    }
  }
}
