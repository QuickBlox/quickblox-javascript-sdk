import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {USERS} from '../../../../core/mocks/mock-Users';

declare var QB: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showchat: boolean;
  id: any;
  name: any;
  UsersDetails: any;
  showChatList: boolean;
  showGroupList: boolean;
  users = USERS;
  username: any;
  usergroup: any;
  chatId: '';

  constructor(private route: ActivatedRoute,
              private router: Router,
  ) {
    this.username = JSON.parse(localStorage.getItem('currentUser'));
    this.showchat = false;
    console.log(this.showchat);
  }
  ngOnInit() {
    const CREDENTIALS = {
      appId: 74712,
      authKey: 'TWfJrn5hLJzLmKk',
      authSecret: '2LYz7-xugNA3rNB'
    };
    this.showchat = true;
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);


    QB.createSession( (e, r) => {
      var params = {login: 'romanes', password: '12345678'};
      QB.login(params, (e, r) => {
        if (r) {
          const filters = null;
          QB.chat.dialog.list(filters, (err, resDialogs) => {
            if (err) {
              return err;
            } else {
              this.UsersDetails = resDialogs.items;
              console.log(resDialogs);
              this.UsersDetails.forEach( (chat, index) => {
                  USERS.push({name: this.UsersDetails[index]._id, type: this.UsersDetails[index].type});
                });
              this.users = USERS;
              }
          });
          QB.chat.connect({userId: r.id, password: this.usergroup}, function (e, roster) {
            if (!e) {
              QB.chat.muc.join('34012_56a15ec7a0eb4791ae0003cc@muc.chat.quickblox.com', function (r) {
                console.log(r);
              });
            }
          });
        }
      });
    });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
  ChatList() {
    console.log(this.users);
    this.showChatList = true;
    this.showGroupList = false;
  }
  GroupList() {
    this.showChatList = false;
    this.showGroupList = true;
  }
  chatOpen(dialogId) {
    this.chatId = dialogId;
    this.showchat = !this.showchat;
    console.log(this.showchat);
    var params = {chat_dialog_id: dialogId, sort_desc: 'date_sent', limit: 100, skip: 0};
    QB.chat.message.list(params, (err, messages) => {
      if (messages) {
          console.log(messages);
      }else{
        console.log(err);
      }
    });
  }

}
