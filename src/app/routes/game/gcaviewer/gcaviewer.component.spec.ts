import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcaviewerComponent } from './gcaviewer.component';

describe('GcaviewerComponent', () => {
  let component: GcaviewerComponent;
  let fixture: ComponentFixture<GcaviewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcaviewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcaviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
