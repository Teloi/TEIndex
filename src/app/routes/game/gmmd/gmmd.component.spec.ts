import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GmmdComponent } from './gmmd.component';

describe('GmmdComponent', () => {
  let component: GmmdComponent;
  let fixture: ComponentFixture<GmmdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GmmdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GmmdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
