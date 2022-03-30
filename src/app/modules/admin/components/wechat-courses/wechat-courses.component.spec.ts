import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WechatCoursesComponent } from './wechat-courses.component';

describe('WechatCoursesComponent', () => {
  let component: WechatCoursesComponent;
  let fixture: ComponentFixture<WechatCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WechatCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WechatCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
