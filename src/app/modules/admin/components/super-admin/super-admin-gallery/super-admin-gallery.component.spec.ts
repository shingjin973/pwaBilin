import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminGalleryComponent } from './super-admin-gallery.component';

describe('SuperAdminGalleryComponent', () => {
  let component: SuperAdminGalleryComponent;
  let fixture: ComponentFixture<SuperAdminGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
