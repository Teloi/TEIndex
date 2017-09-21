import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerOctreeComponent } from './viewer-octree.component';

describe('ViewerOctreeComponent', () => {
  let component: ViewerOctreeComponent;
  let fixture: ComponentFixture<ViewerOctreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerOctreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerOctreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
