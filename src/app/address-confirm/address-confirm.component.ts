import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormControlName } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-address-confirm',
  templateUrl: './address-confirm.component.html',
  styleUrls: ['./address-confirm.component.css']
})
export class AddressConfirmComponent implements OnInit, OnDestroy {
  @Input() firstName!: string;
  lastName: any;
  address: any;
  city: any;
  postcode: any;
  houseNumber:  any;
  street: any;
  phoneNo: any;
  postal: any
  addressConfirm: any;
  userDetails: any = JSON.parse(localStorage.getItem('userDetails'));
  deliveryType: any = localStorage.getItem('deliveryType');
  disableHouseNo: boolean;
  disableStreet: boolean;
  disableCity: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    document.body.classList.add('body-height-auto');
    console.log(JSON.parse(localStorage.getItem('userDetails')));

    this.firstName = this.userDetails.firstName;
    this.lastName = this.userDetails.lastName;
    this.address = this.userDetails.address;
    this.houseNumber = this.userDetails.houseNumber ? this.userDetails.houseNumber : null;
    this.street = this.userDetails.street ? this.userDetails.street : null;
    this.city = this.userDetails.city ? this.userDetails.city : null;
    this.phoneNo = this.userDetails.contact;
    this.postal = localStorage.getItem('postal') ? localStorage.getItem('postal') : null;
    this.postcode = localStorage.getItem('postcode');

    /* if(this.houseNumber) {
      this.disableHouseNo = true;
    }
    if(this.street) {
      this.disableStreet = true;
    } */
    /* if(this.city) {
      this.disableCity = true;
    } */

    this.addressConfirm = new FormGroup({
      "firstName": new FormControl({value: this.firstName, disabled: true},[Validators.required]),
      "lastName": new FormControl({value: this.lastName, disabled: true}, [Validators.required]),
      "houseNumber": new FormControl({value: this.houseNumber, disabled: this.disableHouseNo}, [Validators.required]),
      "street": new FormControl({value: this.street, disabled: this.disableStreet}, [Validators.required]),
      "city": new FormControl({value: this.city, disabled: this.disableCity},[Validators.required]),
      "address1": new FormControl({value: this.postcode, disabled: true},[Validators.required]),
      "phoneNo": new FormControl({value: this.phoneNo, disabled: true},[Validators.required, /* Validators.min(1000000000), Validators.max(9999999999) */]),
      "postcode": new FormControl({value: this.postcode, disabled: true}),
      "note": new FormControl('')
    });
  }

  ngOnInit(): void {
  }

  paymentMethod(addressDetails: any)
  {
    console.log('payment method');
    console.log(addressDetails);

    if(this.deliveryType=='DELIVERY') {
      /* this.userDetails.address = addressDetails.street + ' ' + addressDetails.houseNumber + ', ' + addressDetails.city; */
      this.userDetails.address = this.addressConfirm.get('street').value + ' '
                                + this.addressConfirm.get('houseNumber').value + ', '
                                + this.addressConfirm.get('city').value;

      this.userDetails.contact = this.addressConfirm.get('phoneNo').value;
      this.userDetails.houseNumber = this.addressConfirm.get('houseNumber').value;
      this.userDetails.street = this.addressConfirm.get('street').value;
      this.userDetails.city = this.addressConfirm.get('city').value;
      this.userDetails.postcode = this.postcode;
    }
    else {
      this.userDetails.contact = this.addressConfirm.get('phoneNo').value;
    }

    localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
    localStorage.setItem('note', addressDetails.note);

    this.router.navigate(['payment-method']);
  }

  logOut()
  {
      localStorage.removeItem('userDetails');
      localStorage.getItem('isPaymentClicked') ? null : localStorage.setItem('isPaymentClicked', 'false');
      localStorage.getItem('deliveryType') ? null : localStorage.setItem('deliveryType', 'PICKUP')
      localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;
      location.replace('/login');
  }

  ngOnDestroy(): void {
      document.body.classList.remove('body-height-auto');
  }

}
