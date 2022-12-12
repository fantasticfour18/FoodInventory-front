import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteMetaService {
  deliveryDiscount: number;
  collectionDiscount: number;

  constructor(private httpClient: HttpClient) { }

  siteDetails(): Observable<any> {
    var headers = new HttpHeaders({
      "restaurant":  environment.restaurant
    });
    var httpOptions = {
      headers: headers
    }
    var result = this.httpClient.get(environment.apiBaseUrl + 'restaurantService/profile/' + environment.restaurant, httpOptions);
    return result;
  }

  updateDiscount(deliveryDiscount: number, collectionDiscount: number){
    this.deliveryDiscount = deliveryDiscount;
    this.collectionDiscount = collectionDiscount;
    // console.log("disc1", this.cartDiscount);
  }
}
