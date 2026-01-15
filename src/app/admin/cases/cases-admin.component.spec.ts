import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesAdminComponent } from './cases-admin.component';

describe('CasesAdminComponent', () => {
  let component: CasesAdminComponent;
  let fixture: ComponentFixture<CasesAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CasesAdminComponent]
    });
    fixture = TestBed.createComponent(CasesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
