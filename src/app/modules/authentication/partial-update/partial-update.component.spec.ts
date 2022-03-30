import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialUpdateComponent } from './partial-update.component';

describe('PartialUpdateComponent', () => {
  let component: PartialUpdateComponent;
  let fixture: ComponentFixture<PartialUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
