import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAnalyticsComponent } from './sales-analytics.component';

describe('SalesAnalyticsComponent', () => {
  let component: SalesAnalyticsComponent;
  let fixture: ComponentFixture<SalesAnalyticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesAnalyticsComponent]
    });
    fixture = TestBed.createComponent(SalesAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
