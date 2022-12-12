import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private orderId: any;
  private ownerId: any;
  private orderNumber: any;
  userData: any = JSON.parse(localStorage.getItem('userDetails'));
  authToken: any = this.userData.token;
  constructor(private httpClient: HttpClient) { }

  ordersHistory():Observable<any>{
    var headers = new HttpHeaders({
      "Authorization": "Bearer "+ this.authToken
    });
    var httpOptions = {
      headers: headers
    }
    var result = this.httpClient.get(environment.apiBaseUrl + 'orderService/getOrders?restId=' + environment.restaurant, httpOptions);
    return result;
  }

  // Getter and Setter for Order ID
  setOrderId(order: any)
  {
    this.orderId = order;
  }

  getOrderId()
  {
    return this.orderId;
  }

  // Getter and Setter for Order Number
  setOrderNumber(order: any)
  {
    this.orderNumber = order;
  }

  getOrderNumber()
  {
    return this.orderNumber
  }

  // Getter and Setter for Owner Email ID
  setOwnerId(owner: any)
  {
    this.ownerId = owner;
  }

  getOwnerId()
  {
    return this.ownerId;
  }

  createStripePaymentIntent(orderTotal: any): Observable<any>
  {
    const headers = new HttpHeaders({
      "Authorization": "Bearer "+ this.authToken
    });
    const httpOptions = {
      headers: headers
    }

    const postData = {
      orderTotal: orderTotal,
      restId: environment.restaurant,
    };

    return this.httpClient.post(environment.apiBaseUrl + 'orderService/stripePaymentIntent', postData, httpOptions);
  }

  makeStripePayment(stripeToken: any, orderTotal: any): Observable<any>
  {
    const headers = new HttpHeaders({
      "Authorization": "Bearer "+ this.authToken
    });
    const httpOptions = {
      headers: headers
    }

    const postData = {
      stripeToken: stripeToken,
      orderTotal: orderTotal,
      restId: environment.restaurant,
    };

    return this.httpClient.post(environment.apiBaseUrl + 'orderService/stripeCheckout', postData, httpOptions);
  }

}
