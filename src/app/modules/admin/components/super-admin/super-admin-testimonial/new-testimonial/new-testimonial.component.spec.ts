import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTestimonialComponent } from './new-testimonial.component';

describe('NewTestimonialComponent', () => {
  let component: NewTestimonialComponent;
  let fixture: ComponentFixture<NewTestimonialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTestimonialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
