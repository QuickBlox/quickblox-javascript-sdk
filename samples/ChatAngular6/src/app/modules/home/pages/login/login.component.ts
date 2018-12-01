import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
declare var QB: any;



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: '/';
  username: any;
  usergroup: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      usergroup: ['', Validators.required]
    });
    this.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }


  get f() { return this.loginForm.controls; }


  login(username: string, usergroup: string) {


    const CONFIG = {
      chatProtocol: {
        active: 2 // set 1 to use bosh, set 2 to use websockets (default)
      },
      debug: {mode: 1} //  debug mode
    };

    const CREDENTIALS = {
      appId: 74712,
      authKey: 'TWfJrn5hLJzLmKk',
      authSecret: '2LYz7-xugNA3rNB'
    };

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);


    QB.createSession((e, r) => {
      var params = {login: this.username, password: this.usergroup};
      QB.login(params, (e, r) => {
        if (r) {
          this.router.navigate([this.returnUrl]);
          QB.chat.connect({userId: r.id, password: '12345678'}, function (e, roster) {
            if (!e) {
              QB.chat.muc.join("34012_56a15ec7a0eb4791ae0003cc@muc.chat.quickblox.com", function (r) {
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
  }
  onSubmit() {
    console.log('form submit clicked..');
    this.submitted = true;

    this.loading = true;
    this.login(this.f.username.value, this.f.usergroup.value);
    const loginInfo = [this.username,this.usergroup];
    localStorage.setItem('currentUser', JSON.stringify(loginInfo));
  }
}
