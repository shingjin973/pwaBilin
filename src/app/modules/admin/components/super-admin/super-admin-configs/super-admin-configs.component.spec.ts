import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminConfigsComponent } from './super-admin-configs.component';

describe('SuperAdminConfigsComponent', () => {
  let component: SuperAdminConfigsComponent;
  let fixture: ComponentFixture<SuperAdminConfigsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminConfigsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminConfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
