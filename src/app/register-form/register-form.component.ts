import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { UserLoginService } from '../services/userlogin.service';
import { FormBuilder, FormGroup, FormControl, Validators, FormControlName } from '@angular/forms';
import { UsersignupService } from '../services/usersignup.service';

import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';

import { SocialAuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { LogoService } from '../services/logo.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  message: any;
  deliveryOptions: boolean = history.state.lastUrl ? (history.state.lastUrl == 'home' ? true : false) : false;
  user: any;
  loggedIn: any;
  isPaymentClicked:any;
  deliveryType: any;
  postcode: any = '';
  isLoading: boolean;
  contact: any = localStorage.getItem('userContact');
  houseNo: any = localStorage.getItem('houseNo') ? localStorage.getItem('houseNo') : null;
  street: any = localStorage.getItem('street') ? localStorage.getItem('street') : null;
  city: any = localStorage.getItem('city') ? localStorage.getItem('city') : null;
  postal: any = localStorage.getItem('postal') ? localStorage.getItem('postal') : null;
  disableHouseNo: boolean;
  disableStreet: boolean;
  disableCity: boolean;

  constructor(private authService: SocialAuthService, public __cartService: CartService, private renderer: Renderer2,
              private formBuilder: FormBuilder, private _userRegisterService: UsersignupService, private _userLoginService: UserLoginService,
              private router: Router, public logoService: LogoService, private http: HttpClient) {

    document.body.classList.add('body-height-auto');

    if(localStorage.getItem('deliveryType')) {
      this.deliveryType = localStorage.getItem('deliveryType');
      this.postcode = localStorage.getItem('postcode');
    }

    if(this.houseNo) {
      this.disableHouseNo = true;
    }
    if(this.street) {
      this.disableStreet = true;
    }
    if(this.city) {
      this.disableCity = true;
    }

    if(this.postal) {
      this.city = null;
    }

    this.renderer.removeClass(document.body, 'modal-open');

    this.registerForm = new FormGroup({
      "firstName": new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z]{3,}')]),
      "lastName": new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z]{3,}')]),
      "email": new FormControl(null, [Validators.required, Validators.email]),
      /* "password": new FormControl(null, [Validators.required]), */
      "houseNumber": new FormControl(this.houseNo, [Validators.required]),
      "street": new FormControl(this.street, [Validators.required]),
      "city": new FormControl(this.city, [Validators.required]),
      "address": new FormControl({value: this.postcode, disabled: true}, [Validators.required]),
      "contact": new FormControl({value: this.contact, disabled: true}, [Validators.required,
        /* Validators.min(1000000000), Validators.max(9999999999) */]),
      "postcode": new FormControl({value: this.postcode, disabled: true} )
    });
  }

/*
  socialLogin() {
    console.log('Register Social Function');
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
          this.message = data.message;
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
    console.log(this.isPaymentClicked);
    console.log(localStorage.getItem('isPaymentClicked'));

    this.authService.authState.subscribe((user) => {
      console.log(user);
      this.isLoading = true;
      document.body.classList.add('overlay-backdrop');

      this._userLoginService.userLogin('social', user.email, user.id, user.firstName, user.lastName).subscribe(
        data => {

          this.isLoading = false;
          document.body.classList.remove('overlay-backdrop');

          console.log(data);
          if (data.success == true) {
            localStorage.setItem('userDetails', JSON.stringify(data.data));
            setTimeout(() => {
              this.isPaymentClicked? this.router.navigate(['address-confirmation']) : this.router.navigate(['']);
              //localStorage.setItem('isPaymentClicked', 'false');
            }, 300);
          } else {
            this.message = data.message;
          }
        }
      )
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

  registerUser() {
    // this.router.navigate(['payment-method']);
    this.isLoading = true;
    document.body.classList.add('overlay-backdrop');
    let postData = this.registerForm.value;
    postData["contact"] = this.registerForm.get('contact').value;

    this._userRegisterService.userRegister(postData).subscribe(
      data => {
        this.isLoading = false;
        document.body.classList.remove('overlay-backdrop');
        if (data.success == true)
        {
          localStorage.setItem('userDetails', JSON.stringify(data.data));
          this.isPaymentClicked ? this.router.navigate(['address-confirmation']) : this.router.navigate(['']);
          localStorage.setItem('isPaymentClicked', 'false');
        }
        else {
          this.message = data.message;
        }
      }, error => {
        this.isLoading = false;
        document.body.classList.remove('overlay-backdrop');
        //this.message = "Email already Exists";
      }
    )
  }

  ngOnDestroy(): void {
    document.body.classList.remove('body-height-auto');
}

}
