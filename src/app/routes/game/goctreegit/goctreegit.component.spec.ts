import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoctreegitComponent } from './goctreegit.component';

describe('GoctreegitComponent', () => {
  let component: GoctreegitComponent;
  let fixture: ComponentFixture<GoctreegitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoctreegitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoctreegitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
