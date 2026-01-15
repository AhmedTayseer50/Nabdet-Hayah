import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationBookingComponent } from './consultation-booking.component';

describe('ConsultationBookingComponent', () => {
  let component: ConsultationBookingComponent;
  let fixture: ComponentFixture<ConsultationBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultationBookingComponent]
    });
    fixture = TestBed.createComponent(ConsultationBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
