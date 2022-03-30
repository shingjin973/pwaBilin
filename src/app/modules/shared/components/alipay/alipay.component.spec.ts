import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlipayComponent } from './alipay.component';

describe('AlipayComponent', () => {
  let component: AlipayComponent;
  let fixture: ComponentFixture<AlipayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlipayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlipayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
