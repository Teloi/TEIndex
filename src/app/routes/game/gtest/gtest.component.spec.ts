import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GtestComponent } from './gtest.component';

describe('GtestComponent', () => {
  let component: GtestComponent;
  let fixture: ComponentFixture<GtestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GtestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
