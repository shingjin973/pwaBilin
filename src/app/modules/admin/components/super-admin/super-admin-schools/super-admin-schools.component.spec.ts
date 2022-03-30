import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminSchoolsComponent } from './super-admin-schools.component';

describe('SuperAdminSchoolsComponent', () => {
  let component: SuperAdminSchoolsComponent;
  let fixture: ComponentFixture<SuperAdminSchoolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminSchoolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminSchoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
