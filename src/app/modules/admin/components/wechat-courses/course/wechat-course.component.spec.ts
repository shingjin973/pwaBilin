import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WechatCourseComponent } from './wechat-course.component';

describe('WechatCourseComponent', () => {
  let component: WechatCourseComponent;
  let fixture: ComponentFixture<WechatCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WechatCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WechatCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
