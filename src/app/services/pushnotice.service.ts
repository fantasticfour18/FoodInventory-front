import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushnoticeService {

  userData: any;
  constructor(private httpClient: HttpClient)
  {}

  sendPushNotification(ownerId: any, orderId: string, orderNumber: string): Observable<any>
  {
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    const authToken = this.userData.token;
    var headers = new HttpHeaders({
      "Authorization": "Bearer " + authToken
    });
    var httpOptions = {
      headers: headers
    }

    const restaurantData = {
      restaurantId: environment.restaurant,
      ownerId: ownerId,
      orderId: orderId,
      orderNumber: orderNumber?.slice(-3)
    }

    return this.httpClient.post(environment.apiBaseUrl + 'pushNoticeService/sendOrderNotification', restaurantData, httpOptions);

  }

}
