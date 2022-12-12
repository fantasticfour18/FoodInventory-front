import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-popup',
  templateUrl: './product-popup.component.html',
  styleUrls: ['./product-popup.component.css']
})
export class ProductPopupComponent implements OnInit {
  @Input() productPopup!: any;
  constructor() { }

  ngOnInit(): void {
    // alert(this.productPopup);
  }

  togglePopup(){
    this.productPopup = (this.productPopup == true ? false : true)
    alert(this.productPopup);
  }

}
