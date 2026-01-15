import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiplomasListComponent } from './diplomas-list.component';

describe('DiplomasListComponent', () => {
  let component: DiplomasListComponent;
  let fixture: ComponentFixture<DiplomasListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiplomasListComponent]
    });
    fixture = TestBed.createComponent(DiplomasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
