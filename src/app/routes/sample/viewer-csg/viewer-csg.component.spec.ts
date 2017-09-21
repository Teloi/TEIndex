import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerCsgComponent } from './viewer-csg.component';

describe('ViewerCsgComponent', () => {
  let component: ViewerCsgComponent;
  let fixture: ComponentFixture<ViewerCsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerCsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerCsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
