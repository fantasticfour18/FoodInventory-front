import { Component, OnInit } from '@angular/core';
import { UserLoginService } from '../services/userlogin.service';
import { Users } from '../classes/users';
import { TemplateRef, ViewChild } from '@angular/core';
import { LogoService } from '../services/logo.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormControlName,
} from '@angular/forms';
import { Router } from '@angular/router';

import { SocialAuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent  {
  userDetails: any = Users;
  loginStatus: any;
  loginForm: FormGroup;
  isPaymentClicked: any;
  isLoading: boolean;

  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>;

  constructor(
    private _userLoginService: UserLoginService,
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: SocialAuthService,
    public logoService: LogoService,
    private http: HttpClient
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.email, Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  userLogin() {
    var email = this.loginForm.value.email;
    var password = this.loginForm.value.password;
    this.isLoading = true;
    document.body.classList.add('overlay-backdrop');

    this._userLoginService.userLogin(null, email, password, null, null).subscribe((data) => {
      this.isLoading = false;
      document.body.classList.remove('overlay-backdrop');
      if (data.success == true) {
        localStorage.setItem('userDetails', JSON.stringify(data.data));
        setTimeout(() => {
          // this.router.navigate(['']);
          this.isPaymentClicked? this.router.navigate(['address-confirmation']) : this.router.navigate(['']);
          localStorage.setItem('isPaymentClicked', 'false');
        }, 300);
        // console.log((localStorage.getItem('userDetails')));
      } else {
        console.log(data);
        this.loginStatus = data.message;

      }
    });
  }

  /*
  socialLogin() {
    console.log('Login Social Function');
    this.authService.authState.subscribe((user) => {
      console.log(user);
      this._userLoginService.userLogin('social', user.email, user.id, user.firstName, user.firstName).subscribe((data) => {
        if (data.success == true) {
          console.log(data);
          localStorage.setItem('userDetails', JSON.stringify(data.data));
          setTimeout(() => {
            this.isPaymentClicked? this.router.navigate(['address-confirmation']) : this.router.navigate(['']);
            //localStorage.setItem('isPaymentClicked', 'false');
          }, 300);
          // console.log((localStorage.getItem('userDetails')));
        } else {
          this.loginStatus = data.message;
        }
      });
    });
  }*/

    ngOnInit(): void {

      this.http.get(environment.apiBaseUrl + environment.logo + '&id=' + environment.restaurant).subscribe((response: any) => {
        this.logoService.setLogo(response.imageData);

      }, (err) => {
        console.log(err);
      });

    if (localStorage.getItem('userDetails')) {
      // location.replace("/order-success");
      this.router.navigate(['']);
    }
    this.isPaymentClicked = (localStorage.getItem('isPaymentClicked') == "true") ? true : false;
    localStorage.setItem('isPaymentClicked', this.isPaymentClicked);
    console.log(this.isPaymentClicked);
    console.log(localStorage.getItem('isPaymentClicked'));


    this.authService.authState.subscribe((user) => {
      console.log(user);
      this.isLoading = true;
      document.body.classList.add('overlay-backdrop');

      this._userLoginService.userLogin('social', user.email, user.id, user.firstName, user.lastName).subscribe((data) => {
        this.isLoading = false;
        document.body.classList.remove('overlay-backdrop');
        console.log(data);
        if (data.success == true) {
          localStorage.setItem('userDetails', JSON.stringify(data.data));
          setTimeout(() => {
            this.isPaymentClicked? this.router.navigate(['address-confirmation']) : this.router.navigate(['']);
            //localStorage.setItem('isPaymentClicked', 'false');
          }, 300);
          // console.log((localStorage.getItem('userDetails')));
        } else {
          this.loginStatus = data.message;
        }
      });
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }
}
