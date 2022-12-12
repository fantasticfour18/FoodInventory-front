import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressConfirmComponent } from './address-confirm.component';

describe('AddressConfirmComponent', () => {
  let component: AddressConfirmComponent;
  let fixture: ComponentFixture<AddressConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
