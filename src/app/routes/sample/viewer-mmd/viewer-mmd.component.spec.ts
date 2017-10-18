import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerMmdComponent } from './viewer-mmd.component';

describe('ViewerMmdComponent', () => {
  let component: ViewerMmdComponent;
  let fixture: ComponentFixture<ViewerMmdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerMmdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerMmdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
