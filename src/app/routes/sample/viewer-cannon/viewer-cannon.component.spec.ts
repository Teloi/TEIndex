import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerCannonComponent } from './viewer-cannon.component';

describe('ViewerCannonComponent', () => {
  let component: ViewerCannonComponent;
  let fixture: ComponentFixture<ViewerCannonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerCannonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerCannonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
