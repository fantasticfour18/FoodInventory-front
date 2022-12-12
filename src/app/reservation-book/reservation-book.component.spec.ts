import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationBookComponent } from './reservation-book.component';

describe('ReservationBookComponent', () => {
  let component: ReservationBookComponent;
  let fixture: ComponentFixture<ReservationBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationBookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
