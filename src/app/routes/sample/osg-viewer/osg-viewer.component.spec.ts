import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsgViewerComponent } from './osg-viewer.component';

describe('OsgViewerComponent', () => {
  let component: OsgViewerComponent;
  let fixture: ComponentFixture<OsgViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsgViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsgViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
