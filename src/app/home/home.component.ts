import { HostListener, Component, ViewChild, OnDestroy, OnInit,
  Renderer2, ElementRef, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ProductsList } from '../services/productslist.service';
import { CartService } from '../services/cart.service';
import { SiteMetaService } from '../services/site-meta.service';
import { PasscodeService } from '../services/passcode.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from '../services/socket.service';
import { HttpClient } from '@angular/common/http';
import { LogoService } from '../services/logo.service';
import { SwiperComponent } from 'swiper/angular';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProductInfoDialogComponent } from '../product-info-dialog/product-info-dialog.component';
import { UserLoginService } from '../services/userlogin.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SessionExpiredDialogComponent } from '../session-expired-dialog/session-expired-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  env: any = environment;
  productPopup: boolean = false;
  cartPopup: boolean = false;
  deliveryPopup: boolean = false;
  number: number = 0;
  number1: number = 0;
  number2: number = 0;
  loginStatus: boolean = false;
  categories: any;
  originalCategories: any;
  products: any;
  popupVariants: any;
  selectedVariant: any;
  selectedSubVariant: any;
  selectedOption: any;
  selectedOptionTopping: any[] = [];
  selectedVariantOption: any;
  isVariantSelected: boolean;
  isSubVariantSelected: boolean;
  isOptionSelected: boolean;
  cartItems: any;
  siteDetails: any;
  product: any;
  toppingCount: number[] = [];
  activeCategory: any = 0;
  isLoading: boolean = true;
  passCodeValidMsg: any = false;
  passcode: boolean = false;
  deliveryType: any;
  userDetails: any;
  profileDropdown: boolean = false;
  isPaymentClicked: boolean = false;
  sticky: number;
  stickyNav: any;
  stickyNavHeight: any;
  stickyMenuItems: any[] = [];
  menuItems: any[] = [];
  webMenuCont: any;
  //cats: any;
  isSticky: boolean = false;
  prevActiveMenuItem: any;
  isGoogleAPIfetching: boolean;
  maxDeliveryDistance: any;
  currentDistance: any;

  catsItems: boolean[] = [];
  scrollWait: any;

  CoverImage: any;
  IconImage: any;

  isMobileView: boolean;
  isItemsInit: boolean = true;
  isItemChanged: boolean;
  currScrollPos: number = 0;
  selectedItem: any;
  addressOptions: any = {
    types: ["postal_code"],
    componentRestrictions: {country: 'DE'}
  }
  isAddressValid: boolean = true;
  noteForm: any;
  searchPlaceholders: any[] = ["Burger", "Shake", "Fries", "Shawarma", "Burrito", "Shrimp", "Taco", "Pancake", "Pizza", "Bacon"];
  showHolder: any = "Suche";
  searchPlaceholderTimeout: any;
  productInfo: any;
  selectedDelAddress: any = null;
  addItemPopupCart: boolean;
  allowDelivery: boolean;
  allowPickup: boolean;
  isReservationActive: boolean;
  openOTPModal: boolean;
  contactInfo: FormGroup;
  isLoginLoad: boolean;
  loginStep: number = 1;
  otpMessage: string;
  userPostalCode: string;
  resendOTPTimer: number = 60;
  timerInterval: any;
  timerSet: any;
  disableResendOTP: boolean;
  acceptedPostcodes: Observable<string[]>;
  postcodeForm: FormControl;
  optionTotal: number = 0;
  toppingViewCount: number = 3;


  @ViewChild('Swiper') swiper: SwiperComponent;
  @ViewChild('categoriesCont') cats: any;
  @ViewChildren('menuItemsCont') menuItemsCont: QueryList<any>;
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  //@ViewChildren('swiperItems') stickyMenuItemsCont: QueryList<any>;

  constructor(private router: Router, private elem: ElementRef, private route: ActivatedRoute,
    private renderer: Renderer2, private __homeMenu: ProductsList,
    public __siteMeta: SiteMetaService, public CartService: CartService, public logoService: LogoService,
    private __passcodeService: PasscodeService, private socketService: SocketioService, private http: HttpClient,
    public dialog: MatDialog, private userService: UserLoginService, private cdr: ChangeDetectorRef)
  {
      route.queryParams.subscribe(param => {
        if(router.getCurrentNavigation().extras.state?.isTokenExpired) {
          this.showSessionExpiredDialog();
        }
      });

      this.contactInfo = new FormGroup({code: new FormControl("49", [Validators.required]),
                                        contact: new FormControl(null, [Validators.required]),
                                        otp: new FormControl(null, [Validators.required])});

      this.postcodeForm = new FormControl(null);

      this.noteForm = new FormGroup({"item-note": new FormControl(null)});
      if(window.innerWidth < 801) {
        this.isMobileView = true;
      }

     //this.socketService.setupSocketConnection();
     this.socketService.joinRoom();
  }

  @HostListener('click', ['$event.target'])
  onClick(btn: any) {
    if (this.deliveryPopup || this.cartPopup || this.productPopup || this.openOTPModal) {
      this.renderer.addClass(document.body, 'modal-open');
    } else {
      this.renderer.removeClass(document.body, 'modal-open');
    }
  }

  listenSockets() {

    this.socketService.on('onImageChange').subscribe(data => {
      let response = data[0];

      if(response.imageType === 'COVER') {
        this.CoverImage = response.imageData;
      }
      else if(response.imageType === 'ICON') {
        this.IconImage = response.imageData;
        this.logoService.setLogo(response.imageData);
      }

    })

    this.socketService.on('refreshHome')
    .subscribe(data =>{
      this.isItemChanged = true;

      this.categories = data[0];
      this.getMenuImages();
      this.originalCategories = Array.from(this.categories);
      this.CartService.categories = this.categories;
      this.CartService.updateItemCounter();

      if(window.innerWidth < 801) {
        window.scrollTo(0, this.currScrollPos - 1);
      }
    })

    this.socketService.on('refreshProfile')
    .subscribe(data =>{
      this.siteDetails = data[0];
      this.initPostCodes();
      this.allowDelivery = this.siteDetails.allowOnlineDelivery;
      this.allowPickup = this.siteDetails.allowOnlinePickup;
      this.isReservationActive = this.siteDetails.isReservationActive;
      this.maxDeliveryDistance = this.siteDetails.deliveryRadius;

      /* let time = this.siteDetails.openTime.split(':');
      this.siteDetails.openTime = time[0] + ':' + time[1];
      time = this.siteDetails.closeTime.split(':');
      this.siteDetails.closeTime = time[0] + ':' + time[1]; */

      this.__siteMeta.updateDiscount(data[0].deliveryDiscount, data[0].collectionDiscount);
      /* if(!localStorage.getItem('userDetails')) {
        localStorage.removeItem('cartItems');
        this.CartService.cartItems = [];
      } */
      this.CartService.cartTotal();
      this.updateDeliverySettings();
      this.checkOrderMode();

    })
  }

  // Get Categroies and Items Image Source and Map to Menu
  getMenuImages()
  {
    this.categories.forEach((category: any) => {
      if(category.imageName?.length)
      {
        category['imgSrc'] = this.env.apiBaseUrl + this.env.menuImage + '?id=' + category._id +
                            '&imageType=category&isNew=' + Date.now() + this.getRandomInt(10000);

        /* this.__homeMenu.getMenuImages(category._id, 'category').subscribe((b64Image: any) => {
          category['b64Image'] = b64Image.imageData;
        }); */
      }

      category.items.forEach((item: any) => {
        if(item.imageName?.length)
        {
          item['imgSrc'] = this.env.apiBaseUrl + this.env.menuImage + '?id=' + item._id +
                          '&imageType=item&isNew=' + Date.now() + this.getRandomInt(10000);

          /* this.__homeMenu.getMenuImages(item._id, 'item').subscribe((b64Image: any) => {
            item['b64Image'] = b64Image.imageData;
          }); */
        }
      });
    });
  }

  ngAfterViewInit()
  {
    this.menuItemsCont.changes.subscribe((data) => {

      this.menuItems = Array.from(data);
      this.getStickyElement();
    });

  }

  ngOnDestroy(): void {
    this.socketService.leaveRoom();
    this.socketService.removeAllListeners();
    clearInterval(this.timerInterval);
    clearTimeout(this.timerSet);
  }

  ngOnInit(): void
  {
    this.loginStatus = localStorage.getItem('userDetails') ? true : false;
    this.userDetails = JSON.parse(localStorage.getItem('userDetails'));

    if(!localStorage.getItem('cartItems')) {
      this.CartService.tip = 0;
     }

    this.listenSockets();

    console.log(this.CartService.deliveryType);
    //Get Cover Image
    this.http.get(this.env.apiBaseUrl + this.env.cover + '&id=' + this.env.restaurant).subscribe((response: any) => {
        this.CoverImage = response.imageData;

      }, (err) => {
        console.log(err);
      });

    //Get Logo Image
    this.http.get(this.env.apiBaseUrl + this.env.logo + '&id=' + this.env.restaurant).subscribe((response: any) => {
        this.IconImage = response.imageData;
        this.logoService.setLogo(response.imageData);

      }, (err) => {
        console.log(err);
      });

      // Get Restaurant Details
    this.__siteMeta.siteDetails().subscribe(data => {
      this.isLoading = false;
      this.siteDetails = data.data;
      this.initPostCodes();
      console.log(this.siteDetails);
      this.allowDelivery = this.siteDetails.allowOnlineDelivery;
      this.allowPickup = this.siteDetails.allowOnlinePickup;
      this.isReservationActive = this.siteDetails.isReservationActive;
      this.maxDeliveryDistance = this.siteDetails.deliveryRadius;
      /* if(this.allowDelivery) {
        this.deliveryPopup = true;
        this.renderer.addClass(document.body, 'modal-open');
      } */

      /* let time = this.siteDetails.openTime.split(':');
      this.siteDetails.openTime = time[0] + ':' + time[1];
      time = this.siteDetails.closeTime.split(':');
      this.siteDetails.closeTime = time[0] + ':' + time[1]; */

      this.__siteMeta.updateDiscount(data.data.deliveryDiscount, data.data.collectionDiscount);
      if(!localStorage.getItem('userDetails')) {

        localStorage.removeItem('cartItems');
        localStorage.removeItem('currentDistance');
          this.CartService.cartItems = [];
          this.CartService.deliveryType = 'PICKUP';
          localStorage.setItem('deliveryType', 'PICKUP');
      }
      else {
        this.CartService.getCart();
      }

      let delType = localStorage.getItem('deliveryType');
      delType ? localStorage.setItem('deliveryType', delType) : localStorage.setItem('deliveryType', 'PICKUP');
      this.selectedDelAddress = localStorage.getItem('postcode') ? localStorage.getItem('postcode') : null;

      this.CartService.cartTotal();
      this.updateDeliverySettings();
      localStorage.removeItem('selectedItem');
      this.checkOrderMode();

    },
      error => {
        alert("Server Under Maintainance");
        return;
      });

      // Get Restaurant Menus
    this.__homeMenu.productsList().subscribe(data => {
      if (data.success == true) {
        this.categories = data.data;
        this.getMenuImages();
        this.originalCategories = Array.from(this.categories);

        this.categories.forEach((cat: any)=> {
          cat.items.forEach((item: any)=>{
            item['itemCount'] = 0;
            item['isOptionPriceSame'] = this.checkOptionPrice(item.options);
          })
        });

        this.CartService.getCart();
        this.CartService.categories = this.categories;
        this.CartService.updateItemCounter();

        console.log(this.categories);
        console.log(this.categories[0].items);

      }
    },
      error => {
        console.log(error);
      });

  }

  checkOptionPrice(options: any[]): boolean
  {
    return new Set(options.map(opt => parseFloat(opt.price).toFixed(2))).size == 1 ? true : false;
  }

  initPostCodes()
  {
    this.acceptedPostcodes = this.postcodeForm.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPostcodes(value || ''))
    );

    this.postcodeForm.setValidators(this.checkAcceptedPostcodes(this.siteDetails.acceptedPostcodes));
  }

  checkAcceptedPostcodes(postcodes: []): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // below findIndex will check if control.value is equal to one of our options or not
      const index = postcodes.findIndex(postcode => {
        return (new RegExp('\^' + postcode + '\$')).test(control.value);
      });
      return index < 0 ? { 'postcodeNotValid': { value: control.value } } : null;
    };
  }

  _filterPostcodes(value: string): string[]
  {
    const searchedQuery = value.toLowerCase();
    return this.siteDetails.acceptedPostcodes.filter((postcode: string) => postcode.toLocaleLowerCase().includes(searchedQuery));
  }

  getStickyElement()
  {
    //this.cats = document.getElementById('categories');
    //console.log(this.cats);

    if(!this.isItemChanged) {
      this.sticky = this.cats.nativeElement.offsetTop;
    }
    //console.log(this.sticky);

    if(window.innerWidth < 801) {
      this.swiper.updateSwiper({});
    }

    //this.menuItems = Array.from(document.getElementsByClassName('stickyScroll'));
    //console.log(this.menuItems[0].offsetTop);

    /*this.stickyMenuItems = this.isMobileView ? Array.from(document.getElementsByClassName("swiper-items")) :
                                               Array.from(document.getElementsByName("stickyMenuItems"));*/

  //console.log(this.stickyNav);
  //console.log(this.stickyMenuItems);
  //console.log(this.menuItems);

  }

  toggleCart() {
    if (this.cartPopup == false) {
      this.cartPopup = true;
    } else {
      this.cartPopup = false;
    }
  }

  isPayment()
  {
    //(this.CartService.cartTotalAmount.subTotal < siteDetails.minimumOrder) ? "#" : (loginStatus == true ? "/address-confirmation" : "/register")
    this.isPaymentClicked = true;
    localStorage.setItem('isPaymentClicked', "true");
    localStorage.removeItem('selectedItem');
    document.body.classList.remove('modal-open');
    console.log("clicked for login after payment");

    if(this.loginStatus)
    {
      if(this.allowDelivery || this.allowPickup)
      {
        this.deliveryPopup = true;
        this.renderer.addClass(document.body, 'modal-open');

        if(this.selectedDelAddress) {
          this.postcodeForm.setValue(this.selectedDelAddress);
        }
      }
    }
    else
    {
      this.renderer.removeClass(document.body, 'modal-open');
      document.getElementById('login-btn')?.click();
    }

    this.cdr.detectChanges();
    /* (this.loginStatus == true ) ? this.router.navigate(['address-confirmation'], { state: { lastUrl: 'home' } }) :
                                  document.getElementById('login-btn')?.click(); */
  }

  changeDeliveryPopup()
  {
    if(this.allowDelivery || this.allowPickup)
    {
      this.deliveryPopup = true;
      this.renderer.addClass(document.body, 'modal-open');

      if(this.selectedDelAddress) {
        this.postcodeForm.setValue(this.selectedDelAddress);
      }

      this.cdr.detectChanges();
    }
  }

  navToCheckout()
  {
    this.deliveryPopup = false;
    this.renderer.removeClass(document.body, 'modal-open');
    this.router.navigate(['address-confirmation'], { state: { lastUrl: 'home' } });
  }

  //For Web & Mobile Scroll
  @HostListener('window:scroll', [])
  onWindowScroll()
  {
    this.currScrollPos = window.scrollY;
    if (window.pageYOffset >= this.sticky)
    {
      if(this.isMobileView) {
        this.cats.nativeElement.classList.add('sticky-mob');
      }

      const currentPos = this.isMobileView ? (window.scrollY - this.sticky + 25) : (window.scrollY - this.sticky + 70);

      for (const i in this.menuItems)
      {
        const top = this.menuItems[i].nativeElement.offsetTop;
        const bottom = this.menuItems[i].nativeElement.offsetTop + this.menuItems[i].nativeElement.offsetHeight;
        /*
        console.log('top ' + top);
        console.log('bottom ' + bottom);
        console.log('Curr ' + currentPos);*/

        if (currentPos >= top && currentPos <= bottom)
        {
          this.activeCategory = i;
          this.isMobileView ? this.swiper.setIndex(parseInt(i)) : '';
          //this.swiper.setIndex(parseInt(i));
          //this.isMobileView ? '' : document.getElementsByClassName('swiperWeb')[0].children[i].scrollIntoView(true);
          //console.log(document.getElementsByClassName('swiperWeb')[0]);

          /*
          for (const index in this.stickyMenuItems) {
            this.stickyMenuItems[index].classList.remove('active');
          }

          this.currCategoryIndex = parseInt(i);
          this.stickyMenuItems[i].classList.add('active');*/
        }
      }
    }
    else if(this.isMobileView) {
      this.cats.nativeElement.classList.remove('sticky-mob');
    }

  }

  scroll(el: any, elIndex: any) {
    document.getElementById(el).scrollIntoView();

      /*
      this.swiper.setIndex(parseInt(elIndex));

      for(const i in this.stickyMenuItems) {
        this.stickyMenuItems[i].classList.remove('active');
      }
      this.stickyMenuItems[elIndex].classList.add('active');
    }*/

  }

  refreshProduts(product: any) {
    this.CartService.cartItems.forEach((item: any) => {
      var el = document.getElementById(product._id) as HTMLInputElement;
      if (item._id != product._id) {
        el.checked = false;
      } else if (item._id == product._id) {
        el.checked = true;
      }
    });
  }

  productVariantsPopup(product: any, hasOption: boolean) {
    //console.log(product);
    this.productPopup = this.productPopup ? false : true;
    this.selectedOption = hasOption ? null : this.selectedOption;
    this.selectedOptionTopping = null;
    this.selectedVariant = null;
    this.selectedSubVariant = null;
    this.isVariantSelected = false;
    this.isSubVariantSelected = false;
    this.isOptionSelected = false;
    if(this.selectedItem)
    {
      localStorage.removeItem('selectedItem');
      this.selectedItem.toppings = [];
      this.selectedItem = null;
    }
    this.toppingCount.length = 0;

    var el = document.getElementById(product._id) as HTMLInputElement;
    if (this.CartService.cartItems.length == 0) {
      el.checked = false;
    }

    if(this.CartService.cartItems.some((item: any) => item._id == product._id)) {
      el.checked = true;
    }
    else {
      el.checked = false;
    }

    /*this.CartService.cartItems.forEach((item: any) => {
      if (item._id != product._id) {
        el.checked = false;
        console.log('For if');
      } else if (item._id == product._id) {
        el.checked = true;
        console.log('For else');
      }
    });*/

    if (!this.productPopup) return;
    this.popupVariants = product.options;
    this.product = product;

    /* for(let i = 0; i < this.product.toppings.length; i++) {
      this.toppingCount.push(0);
    } */

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
    this.selectedOption = false;
    this.toppingCount.length = 0;
  }

  ifItemExists(itemId: any) {
    return this.CartService.cartItems.find((item: any) => item._id === itemId ? true : false);
  }

  // Function for setting Options
  selectProductOption(product: any, option: any = []) {
    let selectedOption: any = {};
    this.isOptionSelected = true;
    this.selectedVariantOption = option;
    if(product.variants.length)
    {
      this.selectedVariant = product.variants;
      if(this.isVariantSelected && this.selectedSubVariant && this.isSubVariantSelected) {
        this.selectedOptionTopping = option.toppings;
      }
      else if(this.isVariantSelected && !this.selectedSubVariant.length) {
        this.selectedOptionTopping = option.toppings;
      }
    }
    else {
      this.selectedOptionTopping = option.toppings;
    }

    const prevSelectedItem = JSON.parse(localStorage.getItem('selectedItem'));
    const initializeToppings = (prevSelectedItem?.option == option.name && this.selectedItem?.toppings) ?
                                this.selectedItem.toppings : [];

    if (option.length == 0)
    {
      selectedOption = {
        _id: product._id,
        category: product.category._id,
        name: product.name,
        option: '',
        price: product.price,
        note: "",
        toppings: initializeToppings,
        discount: product.discount? product.discount : 0,
        catDiscount: product.category.discount? product.category.discount : 0,
        overallDiscount: localStorage.getItem('deliveryType') == 'PICKUP' ? this.__siteMeta.collectionDiscount : this.__siteMeta.deliveryDiscount,
        excludeDiscount: product.excludeDiscount,
        variant: this.selectedItem?.variant?.length ? this.selectedItem.variant : '',
        variantPrice: this.selectedItem?.variant?.length ? this.selectedItem.variantPrice : 0,
        subVariant: this.selectedItem?.subVariant?.length ? this.selectedItem.subVariant : '',
        subVariantPrice: this.selectedItem?.subVariant?.length ? this.selectedItem.subVariantPrice : 0
      }
      this.toppingCount.length = 0;

    }
    else
    {
      selectedOption = {
        _id: product._id,
        category: product.category._id,
        name: product.name,
        option: option.name,
        price: option.price,
        note: "",
        toppings: initializeToppings,
        discount: product.discount? product.discount : 0,
        catDiscount: product.category.discount? product.category.discount : 0,
        overallDiscount: localStorage.getItem('deliveryType') == 'PICKUP' ? this.__siteMeta.collectionDiscount : this.__siteMeta.deliveryDiscount,
        excludeDiscount: product.excludeDiscount,
        variant: this.selectedItem?.variant?.length ? this.selectedItem.variant : '',
        variantPrice: this.selectedItem?.variant?.length ? this.selectedItem.variantPrice : 0,
        subVariant: this.selectedItem?.subVariant?.length ? this.selectedItem.subVariant : '',
        subVariantPrice: this.selectedItem?.subVariant?.length ? this.selectedItem.subVariantPrice : 0
      }
    }

    // Check if variant is selected add to option data
    /* if(this.selectedItem?.variant?.length)
    {
      selectedOption.variant = this.selectedItem.variant;
      selectedOption.variantPrice = this.selectedItem.variantPrice;
    } */

    // Check if sub variant is selected add to option data
    /* if(this.selectedItem?.subVariant?.length)
    {
      selectedOption.subVariant = this.selectedItem.subVariant;
      selectedOption.subVariantPrice = this.selectedItem.subVariantPrice;
    } */

    // Check if option is changed, re-initialize toppings
    if(prevSelectedItem?.option != option.name)
    {
      this.toppingCount.length = 0;
      for(let i = 0; i < option.toppings.length; i++) {
        this.toppingCount.push(0);
      }
      let totalVars = (this.selectedItem?.variantPrice ? parseFloat(this.selectedItem.variantPrice) : 0) +
                      (this.selectedItem?.subVariantPrice ? parseFloat(this.selectedItem.subVariantPrice) : 0)
      this.optionTotal = parseFloat(selectedOption.price) + totalVars;
    }

    this.selectedItem = JSON.parse(JSON.stringify(selectedOption));
    localStorage.setItem('selectedItem', JSON.stringify(selectedOption));
    //console.log(this.selectedItem);

    // Check for activating Add to Cart Button
    if(product.variants.length && this.isVariantSelected && this.selectedSubVariant.length && !this.isSubVariantSelected) {
      this.addItemPopupCart = false;
    }
    else if(product.variants.length && !this.isVariantSelected) {
      this.addItemPopupCart = false;
    }
    else {
      this.addItemPopupCart = true;
    }

    return selectedOption;
  }

  // Function for Setting Variants
  selectVariant(variant: any = []){
    console.log(variant);
    this.isVariantSelected = true;
    console.log(this.selectedVariantOption);
    const prevSelectedItem: any = JSON.parse(localStorage.getItem('selectedItem'));

    if (variant.subVariants?.length == 0)
    {
      this.isSubVariantSelected = false;
      this.selectedSubVariant = [];
      this.selectedItem.subVariant = '';
      this.selectedItem.subVariantPrice = 0;
      this.selectedOptionTopping = this.selectedVariantOption.toppings;
    }
    else
    {
      this.selectedSubVariant = variant.subVariants;
      if(prevSelectedItem.variant != variant.name && !this.isSubVariantSelected)
      {
        this.isSubVariantSelected = false;
        this.selectedOptionTopping = [];
      }
    }

    if (variant.length == 0) {
      this.selectedItem.variant = '';
    }
    else
    {
      this.selectedItem.variant = variant.name;
      this.selectedItem.variantPrice = variant.price;
    }

    // Check if variant is changed, re-initialize toppings
    if(prevSelectedItem?.variant != variant.name && variant.subVariants.length == 0)
    {
      this.selectedItem.toppings = [];
      this.toppingCount.length = 0;
      for(let i = 0; i < this.selectedOptionTopping.length; i++) {
          this.toppingCount.push(0);
      }
    }

    this.selectedItem = JSON.parse(JSON.stringify(this.selectedItem));
    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));

    // Check for activating Add to Cart Button
    if(variant.subVariants.length && (prevSelectedItem.variant != variant.name || !this.isSubVariantSelected)) {
      this.addItemPopupCart = false;
    }
    else {
      this.addItemPopupCart = true;
    }

    this.optionTotal = parseFloat(this.selectedItem.price) + parseFloat(this.selectedItem.variantPrice);
    return this.selectedItem;

  }

  // Function for Setting subVariants
  selectSubVariants(subVariant: any = []){
    this.isSubVariantSelected = true;
    if(subVariant) {
      this.selectedOptionTopping = this.selectedVariantOption.toppings;
    }

    if (subVariant.length == 0) {
      this.selectedItem.subVariant = '';
    }
    else
    {
      this.selectedItem.subVariant = subVariant.name;
      this.selectedItem.subVariantPrice = subVariant.price;
    }

    // Check if sub variant is changed, re-initialize toppings
    const prevSelectedItem: any = JSON.parse(localStorage.getItem('selectedItem'));
    if(prevSelectedItem?.subVariant != subVariant.name)
    {
      this.selectedItem.toppings = [];
      this.toppingCount.length = 0;
      for(let i = 0; i < this.selectedOptionTopping.length; i++) {
          this.toppingCount.push(0);
      }
    }

    this.selectedItem = JSON.parse(JSON.stringify(this.selectedItem));
    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));

    this.addItemPopupCart = true;
    this.optionTotal = parseFloat(this.selectedItem.price) + parseFloat(this.selectedItem.variantPrice) +
                       parseFloat(this.selectedItem.subVariantPrice);
    return this.selectedItem;
  }

  toppingsTotal(item: any){
    var toppingTotal = 0;
    item.toppings.forEach((topping: any) => toppingTotal += (parseFloat(topping.price) * parseFloat(topping.toppingCount)));
    return toppingTotal;
  }

  variantTotal(item: any){
    var variant = item.variantPrice? parseFloat(item.variantPrice) : 0;
    var subVariant = item.subVariantPrice? parseFloat(item.subVariantPrice) : 0;
    return variant + subVariant;
  }

  itemTotal(itemsPrice:any, item:any){
    return ((parseFloat(itemsPrice) + this.toppingsTotal(item) + this.variantTotal(item)) * item.quantity).toFixed(2);
  }

  handleAddressChange(searchAddress: any, isEnterKeyPress: boolean = false)
  {
    console.log(searchAddress);

    /* let pacContainers: any = Array.from(document.getElementsByClassName('pac-container'));
    let pacItems: any[] = [];
    let pacAddressList: any[] = [];
    let address: any = {};

    if(searchAddress.name || searchAddress.formatted_address) {
      address = searchAddress;
    }
    else {
      address['name'] = searchAddress.target.value
    }

    if(pacContainers.length) {
      pacItems = Array.from(pacContainers[pacContainers.length - 1].children);
    }

    pacItems.forEach((pacItem: any) => {
      pacAddressList.push(pacItem.innerText.trim().replace(/\s/g,  '').toLowerCase())
    }); */

    /* if(pacAddressList.some((pacAddress: any) => pacAddress == (address.name.trim().replace(/\s/g,  '').toLowerCase()))) {
      this.isAddressValid = true;
    } */
    /* if((pacItems.length == 0) && address.formatted_address
      && this.checkHouseNumber(address) && this.checkStreetName(address) && this.checkCity(address) && this.checkPostcode(address)) {
      this.isAddressValid = true;
      console.log('house no, street name, city and postcode');
    } */
    /* else if((pacItems.length == 0) && address.formatted_address
      && this.checkHouseNumber(address) && this.checkStreetName(address) && this.checkCity(address)) {
      this.isAddressValid = true;
      console.log('house no, street name and city');
    } */
    /* else if((pacItems.length == 0) && address.formatted_address
      && this.checkStreetName(address) && this.checkCity(address) && this.checkPostcode(address)) {
      this.isAddressValid = true;
      console.log('street name, city and postcode');
    } */
    /* if((pacItems.length == 0) && address.formatted_address && this.checkCity(address) && this.checkPostcode(address)) {
      this.isAddressValid = true;
      console.log('city and postcode');
    }
    else {
      this.isAddressValid = false;
    }

    // If Address is correct closes popup
    if(this.isAddressValid && isEnterKeyPress)
    {
      console.log(address);
      this.isGoogleAPIfetching = true;
      this.checkDistance(address.place_id, address.formatted_address, address);
    } */

  }

  // Check for House No.
  checkHouseNumber(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('street_number')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for StreetName
  checkStreetName(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('route')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for City
  checkCity(address: any): boolean {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('locality')) {
        isValid = true;
      }
    });

    return isValid;
  }

  // Check for Postcode
  checkPostcode(address: any): boolean
  {
    let isValid = false;

    address.address_components.forEach((address: any) => {
      if(address.types?.includes('postal_code'))
      {
        isValid = true;
        this.userPostalCode = address.long_name;
      }
    });

    return isValid;
  }

  checkPostcodeDistance(postcode: any)
  {
    this.currentDistance = postcode;
    localStorage.setItem('currentDistance', this.currentDistance);

    this.selectedDelAddress = postcode;
    this.postcodeForm.setValue(postcode);
    localStorage.setItem('deliveryType', 'DELIVERY');
    localStorage.setItem('postcode', postcode);
    this.CartService.deliveryType = "DELIVERY";
    this.passcode = true;
    console.log(this.userDetails);

    this.updateDeliverySettings();

    localStorage.removeItem('houseNo');
    localStorage.removeItem('street');
    localStorage.removeItem('city');
    localStorage.removeItem('postal');
    localStorage.setItem('postal', postcode);

    if(this.elem.nativeElement.querySelector('#collection'))
    {
      this.elem.nativeElement.querySelector('#collection')?.classList.remove('delivery-selection-label-active');
      this.elem.nativeElement.querySelector('#delivery')?.classList.add('delivery-selection-label-active');
    }
    else
    {
      this.elem.nativeElement.querySelector('#collectionMob')?.classList.remove('delivery-selection-label-active');
      this.elem.nativeElement.querySelector('#deliveryMob')?.classList.add('delivery-selection-label-active');
    }

    if(this.CartService.deliveryType == 'DELIVERY' && this.CartService.cartTotalAmount.subTotal < this.siteDetails.minimumOrder)
    {
      this.deliveryPopup = false;
      this.renderer.removeClass(document.body, 'modal-open');
      if(this.isMobileView) {
        this.toggleCart();
      }
    }



    /* this.deliveryPopup = false;
    this.renderer.removeClass(document.body, 'modal-open'); */
  }

  /* checkDistance(placeId: any, destination_add: any, address: any) {

    this.__passcodeService.checkPasscodes(this.siteDetails.passcode[0], placeId).subscribe(response => {
      this.isGoogleAPIfetching = false;
      const googleAPIResponse = response;
      console.log(googleAPIResponse);

      if(googleAPIResponse.data.rows[0].elements[0].status === 'NOT_FOUND' ||
        googleAPIResponse.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
        this.passCodeValidMsg = "Invalid Postcode";
      }
      else if (googleAPIResponse.data.rows[0].elements[0].status === 'OK') {
          const distanceInfo = googleAPIResponse.data.rows[0].elements[0].distance.text.split(' ');
          // If distance is in Meter, convert it into KM
          distanceInfo[0] = (distanceInfo[1] == 'm') ? (distanceInfo[0] / 1000) : distanceInfo[0];

          let distance = parseFloat(distanceInfo[0].toString().replace(/,/g, ''));

          *----
          if(distance > this.maxDeliveryDistance) {
            this.passCodeValidMsg = "Leider liefern wir nicht in Ihr Gebiet."; // Sorry, currently we're not delivering to your area.
          }
          ----*
          if(!this.siteDetails.acceptedPostcodes.includes(this.userPostalCode)) {
            this.passCodeValidMsg = "Leider liefern wir nicht in Ihr Gebiet."; // Sorry, currently we're not delivering to your area.
          }
          else
          {
            this.currentDistance = distance;
            localStorage.setItem('currentDistance', this.currentDistance);

            this.selectedDelAddress = address.formatted_address;
            localStorage.setItem('deliveryType', 'DELIVERY');
            localStorage.setItem('postcode', destination_add);
            this.CartService.deliveryType = "DELIVERY";
            this.passcode = true;
            console.log(this.userDetails);

            this.updateDeliverySettings();

            localStorage.removeItem('houseNo');
            localStorage.removeItem('street');
            localStorage.removeItem('city');
            localStorage.removeItem('postal');

            address.address_components.forEach((address: any) => {
              if(address.types?.includes('street_number')) {
                localStorage.setItem('houseNo', address.long_name);
              }
              else if(address.types?.includes('route')) {
                localStorage.setItem('street', address.long_name);
              }
              else if(address.types?.includes('locality')) {
                localStorage.setItem('city', address.long_name);
              }
              else if(address.types?.includes('postal_code')) {
                localStorage.setItem('postal', address.long_name);
              }
            });

            if(this.elem.nativeElement.querySelector('#collection')) {
              this.elem.nativeElement.querySelector('#collection')?.classList.remove('delivery-selection-label-active');
              this.elem.nativeElement.querySelector('#delivery')?.classList.add('delivery-selection-label-active');
            }
            else {
              this.elem.nativeElement.querySelector('#collectionMob')?.classList.remove('delivery-selection-label-active');
              this.elem.nativeElement.querySelector('#deliveryMob')?.classList.add('delivery-selection-label-active');
            }

            this.deliveryPopup = false;
            this.renderer.removeClass(document.body, 'modal-open');

            *----
            this.elem.nativeElement.querySelector('#collection').checked = false;
            this.elem.nativeElement.querySelector('#delivery').checked = true;
            if (this.elem.nativeElement.querySelector('#collectionmob1')) {
              this.elem.nativeElement.querySelector('#collectionmob1').checked = false;
            }
            if (this.elem.nativeElement.querySelector('#deliverymob1')) {
              this.elem.nativeElement.querySelector('#deliverymob1').checked = true;
            } ----*
          }
      }
    },
      (error: any) => {
        console.log(error);
      });
  } */

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

  updateCartNote(event: any) {
    this.CartService.updateNote(event.target.value);
  }

  redirectToRegister() {
    this.loginStatus == true ? this.router.navigate(['register'], { state: { lastUrl: 'home' } }) : this.router.navigate(['payment-method']);
  }

  addTopings(value: any, index: number, el: any, deleteClick: boolean = false) {
    // console.log(this.selectedOption.toppings.indexOf(value));
    //Push Topping Name
    if(this.selectedItem && !deleteClick && !this.selectedItem.toppings.some((topping: any) => topping._id == value._id)) {
      this.selectedItem.toppings.push(value);
      //this.selectedOption.toppings.splice(this.selectedOption.toppings.indexOf(value), 1);
      //return;
    }

    console.log(this.selectedItem);
    console.log(this.toppingCount);
    //Set Topping Counts
    if(this.selectedItem && this.toppingCount[index] < 1000 && !deleteClick)
    {
      ++this.toppingCount[index];

      this.selectedItem.toppings.forEach((item: { name: any; toppingCount: number; }) => {
        if(item.name === value.name) {
          item.toppingCount = this.toppingCount[index];
          this.optionTotal += value.price;
        }
      });
    }
    else if(this.selectedItem && this.toppingCount[index] > 0)
    {
      --this.toppingCount[index];

      let toppingIndex = -1;
      this.selectedItem.toppings.forEach((item: { name: any; toppingCount: number; }, i: any) => {
        if(item.name === value.name)
        {
          toppingIndex = i;
          item.toppingCount = this.toppingCount[index];
          this.optionTotal -= value.price;
        }
      });

      // Remove topping from item if Count is zero
      console.log(toppingIndex);
      if(this.toppingCount[index] == 0) {
        this.selectedItem.toppings.splice(toppingIndex, 1);
      }
    }

    if(this.toppingCount[index] > 0) {
      el.classList.add('topping-label');
    }

    localStorage.setItem('selectedItem', JSON.stringify(this.selectedItem));
    //console.log(this.selectedOption.toppings);
    console.log(this.optionTotal);

    /* if(deleteClick) {
      this.optionTotal -= this.toppingsTotal(this.selectedItem);
    }
    else {
      this.optionTotal += this.toppingsTotal(this.selectedItem);
    } */
    console.log(this.toppingsTotal(this.selectedItem));


    console.log(this.toppingCount);
  }

  addToCart()
  {
    this.CartService.updateCart(JSON.parse(localStorage.getItem('selectedItem')));
    this.selectedItem = null;
    localStorage.removeItem('selectedItem');
    this.isOptionSelected = this.isVariantSelected = this.isSubVariantSelected = false;
    this.selectedOptionTopping = this.selectedVariant = this.selectedSubVariant = null;

    this.CartService.updateItemCounter();
  }

  setOrderMode()
  {
    localStorage.setItem('deliveryType', 'PICKUP');
    this.CartService.deliveryFee = 0;
    localStorage.removeItem('postcode');

    this.deliveryPopup = false;
    this.renderer.removeClass(document.body, 'modal-open');
    if(this.CartService.cartTotalAmount.subTotal != 0) {
      this.router.navigate(['address-confirmation'], { state: { lastUrl: 'home' } });
    }
  }

  // Check order type and apply actions Delivery or Pickup
  checkOrderMode()
  {
    if(this.allowDelivery || this.allowPickup)
    {
      // If Delivery is closed switch to Pickup
      if(!this.allowDelivery && this.allowPickup)
      {
        this.deliveryPopup = false;
        setTimeout(() => document.getElementById('collection')?.click());
        setTimeout(() => document.getElementById('collectionMob')?.click());
      }
      // If Pickup is closed switch to Delivery
      else if(this.allowDelivery && !this.allowPickup)
      {
        this.cartPopup = false;
        this.deliveryPopup = true;
        this.renderer.addClass(document.body, 'modal-open');
      }
    }
    //If both is closed disable popup and show notice message
    else {
      this.deliveryPopup = false;
    }
  }

  logOut()
  {
    console.log('Logout');
    if (localStorage.getItem('userDetails')) {
      localStorage.removeItem('userDetails');
      this.isPaymentClicked = false;
      localStorage.setItem('isPaymentClicked', 'false');
      localStorage.setItem('deliveryType', 'PICKUP')
      localStorage.getItem('postcode') ? localStorage.removeItem('postcode') : null;
      location.replace('/');
    } else {
      location.replace('/');
    }
  }

  showNote(index: number)
  {
    let item_note: any, item_note_input: any, cartItems = this.CartService.cartItems;

    if(this.isMobileView)
    {
      item_note = 'item-note-mob';
      item_note_input = 'item-note-input-mob';
    }
    else
    {
      item_note = 'item-note';
      item_note_input = 'item-note-input';
    }

    document.getElementsByName(item_note)[index].classList.add('hide-note-label');

    let noteInput: any = document.getElementsByName(item_note_input)[index];
    noteInput.classList.remove('hide-note-label');
    noteInput.classList.add('show-note-input');

    noteInput.focus();
    noteInput.defaultValue = cartItems[index].note;


  }

  addNote(event: any, index: number)
  {
    console.log(event.target.value);
    this.CartService.addNote(event.target.value, index)
  }

  showPlaceholders()
  {
    this.showHolder = "Suche \"" + this.searchPlaceholders[this.getRandomInt(this.searchPlaceholders.length)] + "\"";
    this.searchPlaceholderTimeout = setInterval(()=>{
      this.showHolder = "Suche \"" + this.searchPlaceholders[this.getRandomInt(this.searchPlaceholders.length)] + "\"";
    }, 3000)
  }

  stopPlaceholders()
  {
    clearInterval(this.searchPlaceholderTimeout);
    this.showHolder = "Suche";
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  //Search Menus
  searchMenus(event: any)
  {

    let searchedItem = event.target.value;
    let filteredCategories;
    let filteredItems;

    // Filter categories
    filteredCategories = this.originalCategories.filter((category: any) => {
      if(category.name.toLowerCase().includes(searchedItem.toLowerCase())
          || category.items.some((item: any) => item.name.toLowerCase().includes(searchedItem.toLowerCase()))) {
        return true;
      }
      else {
        return false;
      }

    });

    // Filter items
     for(let i = 0; i < filteredCategories.length; i++)
    {
      filteredItems = filteredCategories[i].items.filter((item: any) => {
        return item.name.toLowerCase().includes(searchedItem.toLowerCase());
      })

      filteredCategories[i] = JSON.parse(JSON.stringify(filteredCategories[i]));
      filteredCategories[i].items = Array.from(filteredItems);
    }



    if(searchedItem.length != 0) {
      this.categories = filteredCategories;
    }
    else {
      this.categories = Array.from(this.originalCategories);
    }

    this.CartService.categories = this.categories;
    this.CartService.updateItemCounter();

  }

  setProductInfo(i: number, j: number)
  {
    this.productInfo = this.categories[i].items[j];
    this.dialog.open(ProductInfoDialogComponent, {data: {item: this.productInfo}, autoFocus: false});

    console.log(this.productInfo);
  }

  // Manage Smooth Auto Scroll for Pop Up
  scrollIntoPopupHeader(fromView: string)
  {
    // Scrolling from options
    if(fromView == 'options')
    {
      // check if variants is available then scroll into it else scroll into toppings
      if(this.selectedVariant?.length) {
        setTimeout (() => document.getElementById('variantHeader').scrollIntoView());
      }
      else {
        setTimeout (() => document.getElementById('toppingHeader')?.scrollIntoView());
      }
    }
    // Scrolling from Variants
    else if(fromView == 'variants')
    {
      // check if sub variants is available then scroll into it else scroll into toppings
      if(this.selectedSubVariant?.length) {
        setTimeout (() => document.getElementById('subVariantHeader').scrollIntoView());
      }
      else {
        setTimeout (() => document.getElementById('toppingHeader')?.scrollIntoView());
      }

    }
    // Scrolling from Sub Variants
    else {
      setTimeout (() => document.getElementById('toppingHeader')?.scrollIntoView());
    }
  }

  /* OTP Login API */
  sendOTP()
  {
    this.isLoginLoad = true
    const postData = {
      contact: "+" + this.contactInfo.get('code').value + "" + this.contactInfo.get('contact').value
    }

    this.userService.sendUserOTP(postData).subscribe(response => {
      this.isLoginLoad = false;
      this.loginStep = 2;
      this.resendOTPTimer = 60;
      this.disableResendOTP = true;
      this.resendOTPTimeout();
    },
    (err) => {
      this.isLoginLoad = false;
      console.error(err);
    })
  }

  get_OTP(code: any)
  {
    if(code.length == 4)
    {
      this.contactInfo.patchValue({otp: code});
    }
  }

  verifyOTP()
  {
    this.isLoginLoad = true
    const postData = {
      contact: "+" + this.contactInfo.get('code').value + "" + this.contactInfo.get('contact').value,
      otp: this.contactInfo.get('otp').value
    }

    this.userService.verifyOTP(postData).subscribe(response => {
      this.isLoginLoad = false;
      console.log(response);
      localStorage.setItem('userContact', postData.contact);
      //User already registered
      if(response.success)
      {
        this.loginStep = 1;
        if(response.userData?.isActive)
        {
          document.getElementById('otpModal-btn')?.click();
          this.renderer.removeClass(document.body, 'modal-open');
          this.userDetails = response.userData;
          localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
          this.loginStatus = true;

          if(this.isPaymentClicked)
          {
            this.deliveryPopup = true;
            this.renderer.addClass(document.body, 'modal-open');
            this.cdr.detectChanges();
          }
          else {
            window.location.reload();
          }
          /* this.isPaymentClicked ? this.router.navigate(['address-confirmation']) : window.location.reload(); */

          this.isPaymentClicked = false;
          localStorage.setItem('isPaymentClicked', 'false');
        }
        else
        {
          document.getElementById('otpModal-btn')?.click();
          this.renderer.removeClass(document.body, 'modal-open');
          this.router.navigate(['register']);
        }
      }
      else {
        this.otpMessage = response.message;
      }
    },
    (err) => {
      this.isLoginLoad = false;
      console.error(err);
    })
  }

  restrictCodeLength(event: any)
  {
    if(event.target.value.length > 4) {
      this.contactInfo.patchValue({otp: event.target.value.substring(0,4)});
    }
  }

  resendOTPTimeout()
  {
    this.timerInterval = setInterval(() => {
      if(this.resendOTPTimer > 0 ) {
        --this.resendOTPTimer
      }
    }, 1000)

    this.timerSet = setTimeout(() => {
      clearInterval(this.timerInterval);
      this.disableResendOTP = false;
    }, 60000)
  }

  clearMobile()
  {
    this.loginStep = 1;
    this.contactInfo.patchValue({code: null, contact: null});
    clearInterval(this.timerInterval);
    clearTimeout(this.timerSet);
  }

  showSessionExpiredDialog()
  {
    this.dialog.open(SessionExpiredDialogComponent, {
      backdropClass: "sessionExpired",
      disableClose: true
    })
  }

  scrollToNextTopping() {
    setTimeout (() => document.getElementById('toppingName3').scrollIntoView());
  }

}
