import { Component, OnInit } from '@angular/core';
import { ProductsList } from '../services/productslist.service';
import { CartService } from '../services/cart.service';
import { SiteMetaService } from '../services/site-meta.service';

@Component({
  selector: 'app-your-order',
  templateUrl: './your-order.component.html',
  styleUrls: ['./your-order.component.css']
})
export class YourOrderComponent implements OnInit {
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
  cartNote: any = localStorage.getItem('note');

  constructor(public __siteMeta: SiteMetaService, public CartService: CartService) { }

  ngOnInit(): void {
    this.__siteMeta.siteDetails().subscribe(data => {
      this.siteDetails = data.data;
      this.__siteMeta.updateDiscount(data.data.deliveryDiscount, data.data.collectionDiscount);
      this.CartService.cartTotal();
    },
      error => {
        alert("Server Under Maintainance");
        return;
      });

    this.cartItems = this.CartService.getCart();
    console.log(this.cartItems);
    this.loginStatus = localStorage.getItem('userDetails') ? true : false;
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

}
