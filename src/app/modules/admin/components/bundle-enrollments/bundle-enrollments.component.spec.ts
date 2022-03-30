import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleEnrollmentsComponent } from './bundle-enrollments.component';

describe('BundleEnrollmentsComponent', () => {
  let component: BundleEnrollmentsComponent;
  let fixture: ComponentFixture<BundleEnrollmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleEnrollmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleEnrollmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
