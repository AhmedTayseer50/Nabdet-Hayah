import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessManagerComponent } from './access-manager.component';

describe('AccessManagerComponent', () => {
  let component: AccessManagerComponent;
  let fixture: ComponentFixture<AccessManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessManagerComponent]
    });
    fixture = TestBed.createComponent(AccessManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
