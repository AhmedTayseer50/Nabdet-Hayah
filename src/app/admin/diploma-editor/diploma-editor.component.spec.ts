import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiplomaEditorComponent } from './diploma-editor.component';

describe('DiplomaEditorComponent', () => {
  let component: DiplomaEditorComponent;
  let fixture: ComponentFixture<DiplomaEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiplomaEditorComponent]
    });
    fixture = TestBed.createComponent(DiplomaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
