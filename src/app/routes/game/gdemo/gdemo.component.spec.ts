import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GdemoComponent } from './gdemo.component';

describe('GdemoComponent', () => {
  let component: GdemoComponent;
  let fixture: ComponentFixture<GdemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GdemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GdemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
