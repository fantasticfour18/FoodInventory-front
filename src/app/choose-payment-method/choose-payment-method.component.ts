import { Component, OnInit, Renderer2, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ProductsList } from '../services/productslist.service';
import { CartService } from '../services/cart.service';
import { SiteMetaService } from '../services/site-meta.service';
import {FormControl, FormGroup} from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OrdersService } from '../services/orders.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
//import * as moment from 'moment';
import * as moment from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { Stripe, loadStripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-choose-payment-method',
  templateUrl: './choose-payment-method.component.html',
  styleUrls: ['./choose-payment-method.component.css']
})
export class ChoosePaymentMethodComponent implements OnInit {
  productPopup: boolean = false;
  cartPopup: boolean = false;
  deliveryPopup: boolean = false;
  number: number = 0;
  number1: number = 0;
  number2: number = 0;
  loginStatus: boolean = false;
  categories: any;
  products: any;
  popupVariants: any;
  selectedVariant: any;
  cartItems: any;
  siteDetails: any;
  product: any;
  errMsg: any = false;
  paymentMode: any;
  payMode: any = 'Barzahlung';
  delOption: any = 'TodayOrder';
  advanceOrderDate: any = '';
  tipOption: any;
  deliveryOption: any;
  cartNote: any = localStorage.getItem('note');
  orderTimeTitle: any = (localStorage.getItem('deliveryType') == 'DELIVERY') ?
                        'Wählen Sie die Lieferzeit Ihrer Wahl' : 'Wählen Sie die Abholzeit Ihrer Wahl';
  orderTimes: any[] = [];

  minDate: any;
  maxDate: any;
  datesFilter: any;
  startAt: any;

  orderType: any = localStorage.getItem('deliveryType');
  orderTotal: any;
  currentDistance: any;
  selectedOrderTime: any;
  isTimeAcceptable: any = true;
  timeSlots: any[] = [];
  orderTime: any = null;
  isHoliday: boolean;
  holidayMessage: any;
  isLoading: boolean;
  menuTimezones: any;
  zoneItems: any[] = [];
  isItemAcceptable: boolean = true;
  isOrderAdding: boolean;
  stripePaymentHandler: any;
  stripeElements: StripeElements;
  isStripeIntentFetching: boolean;
  isStripePayEnabled: boolean;
  stripePaymentCards: StripePaymentElement;

  public choose = "";
  setvalue(drp:any){
    this.choose=drp.target.value;
  }

  public payPalConfig ? : IPayPalConfig;
  public stripe: Stripe;

  @ViewChild('payPalBtns') payPal: ElementRef;

  constructor(private router: Router, private elem: ElementRef,
    private renderer: Renderer2, private __homeMenu: ProductsList, public __siteMeta: SiteMetaService,
    public CartService: CartService, private orderService: OrdersService, private cdr: ChangeDetectorRef) {

    const userDetails = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails')) : null;
    this.cartItems = CartService.getCart();

   /* if(!this.cartItems && userDetails && !jwthelper.isTokenExpired(userDetails.token)) {
      router.navigate(['/']);
      return;
    }*/

    console.log('After Routing');

    this.paymentMode = new FormGroup({"mode": new FormControl('Barzahlung'),
                                      "orderTime": new FormControl('Sofort'),
                                      "advanceOrder": new FormControl('TodayOrder'),
                                      "tip": new FormControl('')});

  }

  ngOnInit(): void {
    this.isLoading = true;
    //Set Timezone to Europe/Berlin globally
    moment.tz.setDefault('Europe/Berlin');

    this.__siteMeta.siteDetails().subscribe(data => {
      this.siteDetails = data.data;
      console.log(this.siteDetails);
      console.log("disc", data.data.discount);

      // Initialize Payment modes
      this.initPayPal();
      //this.initStripe();

      this.__siteMeta.updateDiscount(data.data.deliveryDiscount, data.data.collectionDiscount);
      this.orderTotal = this.CartService.cartTotal().total;
      console.log('Total: ' + this.orderTotal);
      this.updateDeliverySettings();

      if(this.CartService.tip != 0) {
        this.paymentMode.patchValue({tip: this.CartService.tip});
      }

      /* this.isLoading = false; */
      this.getMenuTimezones();
    },
      error => {
        alert("Server Under Maintainance");
        return;
      });

    this.cartItems = this.CartService.getCart();
    console.log(this.cartItems);
    this.loginStatus = localStorage.getItem('userDetails') ? true : false;
  }

  // Get Menu Timezones
  getMenuTimezones()
  {
    this.__homeMenu.getMenuTimezones().subscribe(data => {

      this.menuTimezones = data.timeZones;
      this.initDeliveryTimes();
      this.initializeCalendar();

      this.isLoading = false;
      console.log("TimeZones ---> ", data);
    },
      error => {
        console.log(error);
    });
  }

  initializeCalendar()
  {
    const minDate = moment().add(1, 'days');
    this.minDate = new Date(minDate.year(), minDate.month(), minDate.date());
    console.log(this.minDate);

    const maxDate = moment().add(7, 'days');
    this.maxDate = new Date(maxDate.year(), maxDate.month(), maxDate.date(), 23, 59);

    this.startAt = new Date(minDate.year(), minDate.month(), minDate.date(),
                            minDate.hours(), minDate.minutes(), minDate.seconds());
    console.log(this.startAt);

    // Get days list
    let days: any[] = [];

    this.siteDetails.timeSlots.forEach((slot: any) => {
      slot.days.forEach((day: any) => {
        days.push(day);
      });
    });

    days = Array.from(new Set(days));

    this.datesFilter = (d: Date | null): boolean => {
      let day = (d || new Date()).getDay();

      if(day == 0 && days.includes('Sunday')) {
        return day == 0;
      }
      else if(day == 1 && days.includes('Monday')) {
        return day == 1;
      }
      else if(day == 2 && days.includes('Tuesday')) {
        return day == 2;
      }
      else if(day == 3 && days.includes('Wednesday')) {
        return day == 3;
      }
      else if(day == 4 && days.includes('Thursday')) {
        return day == 4;
      }
      else if(day == 5 && days.includes('Friday')) {
        return day == 5;
      }
      else {
        return day == 6;
      }
    }
  }

  toggleCart() {
    if (this.cartPopup == false) {
      this.cartPopup = true;
    } else {
      this.cartPopup = false;
    }
  }

  productVariantsPopup(product: any) {
    console.log(product.options);
    this.popupVariants = product.options;
    this.product = product;
    this.productPopup = this.productPopup ? false : true;
    this.selectedVariant
    return;
  }

  decreaseValue(variable: any, i: number) {
    var quantity = parseInt(this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value);
    if (quantity == 1) return;
    this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value = (quantity - 1);
    this.CartService.updateQuantity(i, quantity - 1);
  }

  increaseValue(variable: any, index: number) {
    var quantity = parseInt(this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value);
    this.elem.nativeElement.querySelectorAll(`.${variable}`)[0].value = quantity + 1;
    this.CartService.updateQuantity(index, quantity + 1);
  }

  toggleVariantProduct() {
    this.productPopup = this.productPopup == true ? false : true;
    this.selectedVariant = false;
  }

  ifItemExists(itemId: any) {
    return this.CartService.cartItems.find((item: any) => item._id === itemId ? true : false);
  }

  selectProductVar(variant: any, product: any) {
    var selectedVariant = {
      _id: product._id,
      name: product.name,
      option: variant.name,
      price: variant.price,
      note: ""
    }
    return selectedVariant;
  }


  initPayPal()
  {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AVMIyvE9uof4kQfgbUwjgOAqFr4LzqXrb1_b6JQdt7dIfMPdTdSx4qJ_8pBr0vFFcLQXBjRbDmqyJB-k',
      createOrderOnClient: () => <ICreateOrderRequest> {
          purchase_units: [{
              amount: {
                  currency_code: 'EUR',
                  value: this.orderTotal,
                  breakdown: {
                      item_total: {
                          currency_code: 'EUR',
                          value: this.orderTotal
                      }
                  }
              },
          }]
      },
      advanced: {
          commit: 'true'
      },
      style: {
          label: 'paypal',
          layout: 'vertical',
      },
      onApprove: (data, actions) => {
          console.log('onApprove - transaction was approved, but not authorized', data, actions);
          this.isLoading = true;
          this.redirect();
          actions.order.get().then((details: any) => {
              console.log('onApprove - you can get full order details inside onApprove: ', details);
          });

      },
      onClientAuthorization: (data) => {
          console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
          //this.showSuccess = true;
      },
      onCancel: (data, actions) => {
          console.log('OnCancel', data, actions);
          //this.showCancel = true;

      },
      onError: err => {
          console.log('OnError', err);
          //this.showError = true;
      },
      onClick: (data, actions) => {
          console.log('onClick', data, actions);
          //this.resetStatus();
      },
  };
}

async initStripe()
{
  this.isStripeIntentFetching = true;
  this.stripe = await loadStripe(environment.stripeAPIkey);

  this.orderService.createStripePaymentIntent(this.orderTotal).subscribe((resp: any) => {
    this.stripeElements = this.stripe.elements({clientSecret: resp.clientSecret});
    this.stripePaymentCards = this.stripeElements.create('payment');
    this.stripePaymentCards.mount("#stripePayment");
    this.isStripeIntentFetching = false;
    this.isStripePayEnabled = true;
  },
  error => {
    console.log(error);
    //this.errMsg = error.error.message;
    this.isStripeIntentFetching = false;

    // If Token gets expired...logout it and navigate user to Homepage
    if(error.status == 401 && error.error.message == "TOKEN EXPIRED") {
      this.logout();
    }
  })


  /* For Stripe Checkout.js */
  /* if (!window.document.getElementById('stripe-script'))
  {
    const script = window.document.createElement('script');
    script.id = 'stripe-script';
    script.type = 'text/javascript';
    script.src = 'https://checkout.stripe.com/checkout.js';
    script.onload = () => {
      this.stripePaymentHandler = (<any>window).StripeCheckout.configure({
        key: environment.stripeAPIkey,
        locale: 'auto',
        token: (stripeToken: any) => {
          console.log(stripeToken);
        },
      });
    };

    window.document.body.appendChild(script);
  } */
}

async makeStripePayment()
{
  this.isLoading = true;
  this.stripe.confirmPayment({
    elements: this.stripeElements,
    redirect: 'if_required'
  })
  .then((resp => {
    if(resp.paymentIntent?.status == 'succeeded') {
      this.redirect();
    }
    else if(resp.error)
    {
      this.isLoading = false;
      if (resp.error.type === "card_error" || resp.error.type === "validation_error") {
        console.error(resp.error.message);
      } else {
        console.error("An unexpected error occurred.");
      }
    }
  }))


  /* For Stripe Checkout.js */
  /* const paymentHandler = (<any>window).StripeCheckout.configure({
    key: environment.stripeAPIkey,
    locale: 'auto',
    token: (stripeToken: any) => {
      console.log(stripeToken);
      paymentstripe(stripeToken);
    },
  });

  const paymentstripe = (stripeToken: any) => {

    this.isLoading = true;
    this.orderService.makeStripePayment(stripeToken, this.orderTotal).subscribe((resp: any) => {
      console.log(resp);
      if (resp.success) {
        console.log(resp);
        this.redirect();
      }
      else {
        this.isLoading = false;
        console.error(resp);
      }
    },
    error => {
      console.log(error);
      //this.errMsg = error.error.message;
      this.isLoading = false;

      // If Token gets expired...logout it and navigate user to Homepage
      if(error.status == 401 && error.error.message == "TOKEN EXPIRED") {
        this.logout();
      }
    });
  };

  paymentHandler.open({
    name: this.siteDetails.restaurantName,
    description: 'Fill out details below',
    amount: parseFloat(this.orderTotal) * 100,
    currency: 'EUR'
  }); */
}

setPaymentMode()
{
  this.payMode = this.paymentMode.get('mode').value;
  console.log(this.payMode);
  this.cdr.detectChanges();

  if(this.payMode == 'Stripe') {
    this.stripePaymentCards?.mount("#stripePayment");
  }
}

  redirect()
  {
    console.log(this.paymentMode.get('mode').value);

    this.isOrderAdding = true;
    this.CartService.proccessCart(this.paymentMode.get('mode').value, this.orderTime)
    .subscribe(data => {
      if (data.success == true) {
        console.log(data);
        this.isOrderAdding = this.isLoading = false;
        localStorage.setItem('isOrderAdded', 'true');
        this.orderService.setOrderId(data.orderId);
        this.orderService.setOrderNumber(data.orderNumber);
        this.orderService.setOwnerId(data.ownerId);
        this.router.navigate(['order-process']);
      } else {
        this.errMsg = data.message;
        this.isOrderAdding = this.isLoading = false;
      }
    },
      error => {
        console.log(error);
        //this.errMsg = error.error.message;
        this.isOrderAdding = this.isLoading = false;

        // If Token gets expired...logout it and navigate user to Homepage
        if(error.status == 401 && error.error.message == "TOKEN EXPIRED") {
          this.logout();
        }
      });
  }

  setDeliveryOption()
  {
    const ownInput = document.getElementById('owlInput') as HTMLInputElement;

    this.delOption = this.paymentMode.get('advanceOrder').value;
    this.delOption == 'TodayOrder' ? ownInput.value = '' : null
    this.isTimeAcceptable = true;
    this.isHoliday = false;

    if(this.delOption == 'TodayOrder')
    {
      this.orderTime = this.paymentMode.get('orderTime').value;
      if(this.orderTime != 'Sofort') {
        this.checkSpecialItemTimes(moment(this.orderTime, "HH:mm"));
      }
    }
    else {
      this.orderTime = ''
    }
  }

  setOrderTime()
  {
    this.orderTime = this.paymentMode.get('orderTime').value;
    if(this.delOption == 'TodayOrder' && this.orderTime != 'Sofort') {
      this.checkSpecialItemTimes(moment(this.orderTime, "HH:mm"));
    }
    console.log(this.orderTime);
  }

  // Function to check and set advance order times
  setAdvanceOrderDateTime(event: any)
  {
    this.isTimeAcceptable = false;
    this.isHoliday = false;

    moment.tz.setDefault();
    const calDateVal = moment(event.value);
    this.advanceOrderDate = calDateVal.format("MMMM Do YYYY, hh:mm a");

    moment.tz.setDefault('Europe/Berlin');
    let calTime = moment(moment(this.advanceOrderDate.split(',')[1], 'hh:mm a').format('HH:mm'), 'HH:mm');
    let calDateDay = moment(this.advanceOrderDate.split(',')[0], "MMMM Do YYYY").format("dddd");

    console.log(calTime);
    console.log('Calendar Day ' + calDateDay);

    for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
    {
      const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
      const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');
      const days = this.siteDetails.timeSlots[i].days;
      const holidayDates = this.siteDetails.timeSlots[i].holidayDates;

      if(this.isBetween(openTime, calTime, closeTime) && days.includes(calDateDay))
      {
        if(holidayDates.includes(calDateVal.format('DD/MM/YYYY')))
        {
          this.isHoliday = true;
          this.holidayMessage = calDateVal.format('DD/MM/YYYY') + ' is Holiday from timings ' +
                                openTime.format('HH:mm') + ' to ' + closeTime.format('HH:mm');
        }
        else {
          this.isTimeAcceptable = true;
          this.checkSpecialItemTimes(moment(calDateVal.format("HH:mm"), "HH:mm"));
        }

        break;
      }
    }

    this.advanceOrderDate = this.isTimeAcceptable ? this.advanceOrderDate : '';
    this.orderTime = (this.advanceOrderDate.length != 0) ? this.advanceOrderDate : '';
    this.setPaymentMode();

    console.log(this.advanceOrderDate);
  }

  // Function to check Special Menu Item times
  checkSpecialItemTimes(advanceTime: moment.Moment)
  {
    let items = JSON.parse(localStorage.getItem('cartItems'));
    this.zoneItems = [];

    this.isItemAcceptable = true;
    items?.forEach((item: any) => {
      this.menuTimezones.forEach((timeZone: any) => {
        const openTime = moment(timeZone.startTime, "HH:mm");
        const closeTime = moment(timeZone.endTime, "HH:mm");

        // Check for Zone Group Categories
        if(timeZone.zoneGroup == 'categories' && timeZone.isActive)
        {
          if(timeZone.items.some((zoneItem: any) => zoneItem.id == item.category) &&
              this.isBetween(openTime, advanceTime, closeTime) == false)
          {
            this.zoneItems.push({item: item, startTime: timeZone.startTime, endTime: timeZone.endTime});
            this.isItemAcceptable = false;
          }
        }
        // Check for Zone Group Items
        else if(timeZone.zoneGroup == 'items' && timeZone.isActive)
        {
          if(timeZone.items.some((zoneItem: any) => zoneItem.id == item._id) &&
            this.isBetween(openTime, advanceTime, closeTime) == false)
          {
            this.zoneItems.push({item: item, startTime: timeZone.startTime, endTime: timeZone.endTime});
            this.isItemAcceptable = false;
          }
        }
      })
    })

    console.log(this.zoneItems);
  }

  setTipOption()
  {
    this.tipOption = this.paymentMode.get('tip').value;
    this.CartService.tip = this.tipOption == null ? 0 : this.tipOption;
    this.CartService.cartTotal();
    console.log(this.tipOption);
  }

  updateDeliverySettings()
  {
    /* this.currentDistance = localStorage.getItem('currentDistance') ? parseFloat(localStorage.getItem('currentDistance')) : 0; */
    this.currentDistance = localStorage.getItem('currentDistance') ? localStorage.getItem('currentDistance') : null;

    let i;
    for(i = 0; i < this.siteDetails.distanceDetails.length; i++) {
      if(this.currentDistance == this.siteDetails.distanceDetails[i].postcode)
      {
        this.siteDetails.deliveryTime = this.siteDetails.distanceDetails[i].deliveryTime;
        this.CartService.orderTime = (this.CartService.deliveryType == 'DELIVERY') ?
            parseInt(this.siteDetails.distanceDetails[i].deliveryTime) : parseInt(this.siteDetails.collectionTime);

        this.siteDetails.minimumOrder = parseFloat(this.siteDetails.distanceDetails[i].minOrder);
        this.CartService.deliveryFee = parseFloat(this.siteDetails.distanceDetails[i].deliveryCharge);
        break;
      }
    }

    // If Postcode is not found in Postcode Distance Details
    if(i == this.siteDetails.distanceDetails.length)
    {
      this.siteDetails.deliveryTime = this.siteDetails.distanceDetails[0].deliveryTime;
        this.CartService.orderTime = (this.CartService.deliveryType == 'DELIVERY') ?
            parseInt(this.siteDetails.distanceDetails[0].deliveryTime) : parseInt(this.siteDetails.collectionTime);

        this.siteDetails.minimumOrder = 0;
        this.CartService.deliveryFee = 0;
    }

    console.log(this.CartService.deliveryFee);
    this.CartService.cartTotal();

    /* for(let i = 0; i < this.siteDetails.distanceDetails.length; i++) {
      if(parseFloat(this.siteDetails.distanceDetails[i].minDistance) <= this.currentDistance
        && this.currentDistance < parseFloat(this.siteDetails.distanceDetails[i].maxDistance))
      {
        this.siteDetails.deliveryTime = this.siteDetails.distanceDetails[i].deliveryTime;
        this.CartService.orderTime = (this.CartService.deliveryType == 'DELIVERY') ?
            parseInt(this.siteDetails.distanceDetails[i].deliveryTime) : parseInt(this.siteDetails.collectionTime);

        this.siteDetails.minimumOrder = parseFloat(this.siteDetails.distanceDetails[i].minOrder);
        this.CartService.deliveryFee = parseFloat(this.siteDetails.distanceDetails[i].deliveryCharge);
        break;
      }
    } */

  }

  initDeliveryTimes()
  {
    let currTime = moment();
    console.log(currTime);
    let addTimes = parseInt(this.CartService.orderTime);
    let dynTime;
    let currOpenTimeIndex = -1;

    // If restaurant is Online show normal timings
    if(this.siteDetails.isOnline)
    {
      this.orderTimes.push('Sofort');

      // Add Time Slots upto close time when current time is between open and close time
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm'); //Date will be current Date
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm'); //Date will be current Date

          if(this.isBetween(openTime, currTime, closeTime))
          {
            dynTime = moment().add(addTimes, 'minutes');
            console.log("Before while--->", dynTime);

            while(this.isBefore(dynTime, closeTime) && this.isBetween(openTime, dynTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'));
              addTimes = 15;
              // Dynamically adds timings, if it reaches midnight (00:00) date will be added and is before will return false
              dynTime = moment(dynTime.add(addTimes, 'minutes'));
              console.log("Inside while--->", dynTime);
            }

            currOpenTimeIndex = i;
            break;
          }
        }
      }

      // Add remaining slots
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(i != currOpenTimeIndex && this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');

          if(this.isBefore(currTime, openTime))
          {
            const openT = moment(openTime);
            dynTime = openT.add(addTimes, 'minutes');
            console.log("Before while--->", dynTime);

            while(this.isBefore(dynTime, closeTime) && this.isBetween(openTime, dynTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'));
              addTimes = 15;
              dynTime = moment(dynTime.add(addTimes, 'minutes'));
              console.log("Inside while--->", dynTime);
            }
          }
        }
      }

      //this.orderTimes = (this.orderTimes.length == 1) ? [] : this.orderTimes;
    }
    // If restaurant is closed show timings for another open times
    else
    {
      for(let i = 0; i < this.siteDetails.timeSlots.length; i++)
      {
        if(this.siteDetails.timeSlots[i].isActive)
        {
          const openTime = moment(this.siteDetails.timeSlots[i].openTime, 'HH:mm');
          const closeTime = moment(this.siteDetails.timeSlots[i].closeTime, 'HH:mm');

          if(this.isBefore(currTime, openTime))
          {
            const openT = moment(openTime);
            dynTime = openT.add(addTimes, 'minutes');
            console.log("Before while--->", dynTime);

            while(this.isBefore(dynTime, closeTime) && this.isBetween(openTime, dynTime, closeTime))
            {
              this.orderTimes.push(dynTime.format('HH:mm'));
              addTimes = 15;
              dynTime = moment(dynTime.add(addTimes, 'minutes'));
              console.log("Inside while--->", dynTime);
            }
          }
        }
      }
    }

    this.orderTimes.length ? this.paymentMode.patchValue({orderTime: this.orderTimes[0]}) : null;
    this.orderTime = this.paymentMode.get('orderTime').value;

    if(this.orderTimes.length == 0)
    {
      console.log('advance order');
      this.orderTime = null;
      this.paymentMode.patchValue({advanceOrder: 'AdvanceOrder'});
    }
    else if(this.orderTimes.length && this.orderTime != 'Sofort') {
      this.checkSpecialItemTimes(moment(this.orderTime, "HH:mm"));
    }

  }

  // Manual Functions for comparing Times
  isBefore(openTime: moment.Moment, closeTime: moment.Moment): boolean
  {
    let openT = new Date(0,0,0,openTime.hours(),openTime.minutes()),
        closeT = new Date(0,0,0,closeTime.hours(),closeTime.minutes());

    /* console.log(openTime.hours() + "--" + openTime.minutes());
    console.log(closeTime.hours() + "--" + closeTime.minutes());
    console.log("Date--->" + openTime.date()); */

    if(openT.getTime() <= closeT.getTime() && openTime.date() == closeTime.date()) {
      return true;
    }
    else {
      return false;
    }
  }

  isBetween(openTime: moment.Moment, currTime: moment.Moment, closeTime: moment.Moment): boolean
  {
    let openT = new Date(0,0,0,openTime.hours(),openTime.minutes()),
        currT = new Date(0,0,0,currTime.hours(),currTime.minutes()),
        closeT = new Date(0,0,0,closeTime.hours(),closeTime.minutes());

    /* console.log(openTime.hours() + "---" + openTime.minutes());
    console.log(currTime.hours() + "---" + currTime.minutes());
    console.log(closeTime.hours() + "---" + closeTime.minutes());
    console.log("Date--->" + currTime.date()); */

    if(openT.getTime() <= currT.getTime() && currT.getTime() <= closeT.getTime()
      && openTime.date() == currTime.date() && currTime.date() == closeTime.date()) {
      return true;
    }
    else {
      return false;
    }
  }

  logout()
  {
    localStorage.removeItem('userDetails');
    localStorage.setItem('isPaymentClicked', 'false');
    localStorage.setItem('deliveryType', 'PICKUP')
    localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;

    let navExtras: NavigationExtras = {
      state: {isTokenExpired: true}
    }

    this.router.navigate(['/'], navExtras);
  }

}

