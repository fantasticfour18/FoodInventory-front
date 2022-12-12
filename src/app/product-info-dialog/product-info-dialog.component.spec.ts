import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInfoDialogComponent } from './product-info-dialog.component';

describe('ProductInfoDialogComponent', () => {
  let component: ProductInfoDialogComponent;
  let fixture: ComponentFixture<ProductInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
