import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcsgComponent } from './gcsg.component';

describe('GcsgComponent', () => {
  let component: GcsgComponent;
  let fixture: ComponentFixture<GcsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
