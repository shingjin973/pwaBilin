import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminFeaturesComponent } from './super-admin-features.component';

describe('SuperAdminFeaturesComponent', () => {
  let component: SuperAdminFeaturesComponent;
  let fixture: ComponentFixture<SuperAdminFeaturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminFeaturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
