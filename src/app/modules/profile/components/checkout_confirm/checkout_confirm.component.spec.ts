import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkout_confirmComponent } from './checkout_confirm.component';

describe('Checkout_confirmComponent', () => {
  let component: Checkout_confirmComponent;
  let fixture: ComponentFixture<Checkout_confirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Checkout_confirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Checkout_confirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
