import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoginModel} from './loginModel';
import {UserService} from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginModel = new LoginModel();
  public userNameRegExString = '^[a-zA-Z]{1}[\\w]{2,19}$';
  public userLoginRegExString = '^[a-zA-Z]{1}[\\w]{2,19}$';
  userNameFocused = true;
  userLoginFocused = true;
  private successUnSubscribe$;

  constructor(private userService: UserService, private router: Router) {
  }

  ngOnInit() {
    this.successUnSubscribe$ = this.userService.successSubject.subscribe(success => {
      if (success) {
        this.router.navigate(['dashboard']);
      }
    });
  }

  public onSubmit() {
    if (this.userNameFocused && this.userLoginFocused) {
      console.log('Login form passed validation and ready to submit.');
      this.userService.login(this.loginModel);
    } else {
      console.log('Login form failed validation');
    }
  }

  onChange() {
    this.userNameFocused = new RegExp(this.userNameRegExString).test(this.loginModel.userName);
    this.userLoginFocused = new RegExp(this.userLoginRegExString).test(this.loginModel.userLogin);
  }
}
