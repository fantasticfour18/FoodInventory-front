import {Component, OnDestroy, OnInit} from '@angular/core';
import { CartService } from '../services/cart.service';
import { SocketioService } from '../services/socket.service';
import { PushnoticeService } from '../services/pushnotice.service';
import { OrdersService } from '../services/orders.service';
import { SiteMetaService } from '../services/site-meta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css']
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  cartItems: any;
  cartNote: any;
  cartSubtotal: any;
  order: any;
  orderStatus: any = 'AUSSTEHEND';
  orderType: any = localStorage.getItem('deliveryType') == 'PICKUP' ? 'Abholung' : 'Lieferung';
  orderTimeTitle: any = localStorage.getItem('deliveryType') == 'PICKUP' ? 'Abholezeit' : 'Lieferzeit';
  timer: any = 30;
  timerInterval: any;
  timerSet: any;

  constructor(public CartService: CartService, private pushService: PushnoticeService, private router: Router,
    private socketService: SocketioService, private orderService: OrdersService, public __siteMeta: SiteMetaService) {

    this.socketService.joinOrderStatus(orderService.getOrderId());
    this.listenSockets();

    console.log('Order Success Constructor');

    if(localStorage.getItem('isOrderAdded') === 'true') {
      this.pushService.sendPushNotification(orderService.getOwnerId(),
          orderService.getOrderId(), orderService.getOrderNumber()).subscribe((response: any) => {
        //console.log(response);

      }, (error: any) => {
        console.log(error);
      });

      localStorage.removeItem('isOrderAdded');
    }

    //this.socketService.setupSocketConnection();
    //this.socketService.joinRoom();

   }

   ngOnDestroy(): void {
     console.log('destroy');
    this.socketService.leaveOrderStatus(this.orderService.getOrderId());
    this.socketService.removeAllListeners();
    clearInterval(this.timerInterval);
    clearTimeout(this.timerSet);
    //this.socketService.leaveRoom();
  }

  listenSockets() {
    this.socketService.on('refreshOrder')
    .subscribe(data =>{
      console.log('refreshOrder', data);
      this.order = data[0];
      this.orderStatus = (this.order && this.order.orderStatus === 'ACCEPTED') ? 'Akzeptiert' : 'Bestritten';
      this.redirectToHome();
    })
  }

  ngOnInit(): void {

    this.cartItems = JSON.parse(localStorage.getItem('cartItems'));
    this.cartNote = localStorage.getItem('note');
    this.orderStatus = 'AUSSTEHEND';
    console.log(document.getElementById('pending'));
    localStorage.removeItem('cartItems');
    localStorage.removeItem('note');
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

  redirectToHome()
  {
    this.timerInterval = setInterval(() => {
      if(this.timer > 0 ) {
        --this.timer
      }
    }, 1000)

    this.timerSet = setTimeout(() => {
      clearInterval(this.timerInterval);
      this.router.navigate(['/']);
    }, 30000)
  }

}
