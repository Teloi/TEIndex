import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GviewerComponent } from './gviewer.component';

describe('GviewerComponent', () => {
  let component: GviewerComponent;
  let fixture: ComponentFixture<GviewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GviewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
