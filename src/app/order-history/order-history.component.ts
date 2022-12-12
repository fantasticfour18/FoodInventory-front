import { AssertNotNull } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ProductPopupComponent } from '../product-popup/product-popup.component';
import { OrdersService } from '../services/orders.service';
import { LogoService } from '../services/logo.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  productPopup: boolean = false;
  passcodePopup: boolean = false;
  ordersList: any = [];

  constructor(private __ordersService: OrdersService, public logoService: LogoService, private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(environment.apiBaseUrl + environment.logo + '&id=' + environment.restaurant).subscribe((response: any) => {
      this.logoService.setLogo(response.imageData);

    }, (err) => {
      console.log(err);
    });

    this.__ordersService.ordersHistory().subscribe(data => {
      console.log(data);

      if(data.success == true){
        this.ordersList = data.data;
      }
    },
    error => {
      console.log(error);
    })
  }



}
