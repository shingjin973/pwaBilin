import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminBalancesComponent } from './super-admin-balances.component';

describe('SuperAdminBalancesComponent', () => {
  let component: SuperAdminBalancesComponent;
  let fixture: ComponentFixture<SuperAdminBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminBalancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
