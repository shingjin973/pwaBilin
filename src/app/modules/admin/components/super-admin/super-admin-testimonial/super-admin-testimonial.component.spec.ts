import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminTestimonialComponent } from './super-admin-testimonial.component';

describe('SuperAdminTestimonialComponent', () => {
  let component: SuperAdminTestimonialComponent;
  let fixture: ComponentFixture<SuperAdminTestimonialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminTestimonialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
