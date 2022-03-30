import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBundleEnrollmentComponent } from './new-bundle-enrollment.component';

describe('NewEnrollmentComponent', () => {
  let component: NewBundleEnrollmentComponent;
  let fixture: ComponentFixture<NewBundleEnrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBundleEnrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBundleEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
