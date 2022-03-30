import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleSidebarComponent } from './bundle-sidebar.component';

describe('BundleSidebarComponent', () => {
  let component: BundleSidebarComponent;
  let fixture: ComponentFixture<BundleSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
