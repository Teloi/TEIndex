import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoctreeComponent } from './goctree.component';

describe('GoctreeComponent', () => {
  let component: GoctreeComponent;
  let fixture: ComponentFixture<GoctreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoctreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoctreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
