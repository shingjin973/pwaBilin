import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedPackagesComponent } from './featured-packages.component';

describe('FeaturedPackagesComponent', () => {
  let component: FeaturedPackagesComponent;
  let fixture: ComponentFixture<FeaturedPackagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturedPackagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
