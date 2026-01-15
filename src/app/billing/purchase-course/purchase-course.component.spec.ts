import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseCourseComponent } from './purchase-course.component';

describe('PurchaseCourseComponent', () => {
  let component: PurchaseCourseComponent;
  let fixture: ComponentFixture<PurchaseCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseCourseComponent]
    });
    fixture = TestBed.createComponent(PurchaseCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
