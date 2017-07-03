import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GindexComponent } from './gindex.component';

describe('GindexComponent', () => {
  let component: GindexComponent;
  let fixture: ComponentFixture<GindexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GindexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GindexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
