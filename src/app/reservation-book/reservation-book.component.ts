import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SiteMetaService } from '../services/site-meta.service';
import { UsersignupService } from '../services/usersignup.service';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-book',
  templateUrl: './reservation-book.component.html',
  styleUrls: ['./reservation-book.component.css']
})
export class ReservationBookComponent implements OnDestroy {
  restProfile: any;
  isLoading: boolean;
  isFormSubmit: boolean;
  resvForm: FormGroup;
  timer: any = 10;
  timerInterval: any;
  timerSet: any;
  showNotice: boolean;

  constructor(private restaurantProfile: SiteMetaService, private userService: UsersignupService, private router: Router)
  {
    this.isLoading = true;
    this.restaurantProfile.siteDetails().subscribe(response => {
      console.log(response);
      this.restProfile = response.data;
      this.isLoading = false;

      this.makeResvForm();
    })
  }

  makeResvForm()
  {
    this.resvForm = new FormGroup({
      "name": new FormControl(null, [Validators.required]),
      "totalPerson": new FormControl(null, [Validators.required]),
      "dateOfResv": new FormControl(null, [Validators.required]),
      "timeOfResv": new FormControl(null, [Validators.required]),
      "phoneNumber": new FormControl(null, [Validators.required]),
      "email": new FormControl(null, [Validators.required, Validators.email]),
      "notes": new FormControl(null)
    })
  }

  sendResvInfo()
  {
    console.log(this.resvForm.value);
    this.isFormSubmit = true;
    this.userService.bookReservation(this.resvForm.value, this.restProfile.restEmail).subscribe((response) => {
      this.isFormSubmit = false;
      console.log(response);
      this.showNotice = true;
      this.redirectToHome();
    },
    (err) => {
      this.isFormSubmit = false;
      console.log(err);
    });
  }

  redirectToHome()
  {
    this.timerInterval = setInterval(() => {
      --this.timer
    }, 1000)

    this.timerSet = setTimeout(() => {
      clearInterval(this.timerInterval);
      this.router.navigate(['/']);
    }, 10000)
  }

  ngOnDestroy(): void
  {
    console.log('destroy');
    clearInterval(this.timerInterval);
    clearTimeout(this.timerSet);
  }

}
