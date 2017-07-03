import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindexComponent } from './bindex.component';

describe('BindexComponent', () => {
  let component: BindexComponent;
  let fixture: ComponentFixture<BindexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
