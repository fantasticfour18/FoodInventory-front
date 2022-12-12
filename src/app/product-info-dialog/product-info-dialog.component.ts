import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-product-info-dialog',
  templateUrl: './product-info-dialog.component.html',
  styleUrls: ['./product-info-dialog.component.css']
})
export class ProductInfoDialogComponent implements OnInit {

  item: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.item = data.item;
    console.log(this.item);
  }

  ngOnInit(): void {
  }

}
