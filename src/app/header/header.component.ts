import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LogoService } from '../services/logo.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userDetails: any = JSON.parse(localStorage.getItem('userDetails'));
  profileDropdown: boolean = false;
  userName: string;

  constructor(public logoService: LogoService, private http: HttpClient)
  {
    if (this.userDetails) {
      this.userName = this.userDetails.firstName;
    }
  }

  ngOnInit(): void {

    this.http.get(environment.apiBaseUrl + environment.logo + '&id=' + environment.restaurant).subscribe((response: any) => {
      this.logoService.setLogo(response.imageData);

    }, (err) => {
      console.log(err);
    });

    this.userName = this.userDetails?.firstName;
  }

  logOut()
  {
    console.log('Logout');
    if (localStorage.getItem('userDetails')) {
      localStorage.removeItem('userDetails');
      localStorage.setItem('isPaymentClicked', 'false');
      localStorage.setItem('deliveryType', 'PICKUP')
      localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;
      location.replace('/');
    } else {
      location.replace('/');
    }
  }

}
