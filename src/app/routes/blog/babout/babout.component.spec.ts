import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaboutComponent } from './babout.component';

describe('BaboutComponent', () => {
  let component: BaboutComponent;
  let fixture: ComponentFixture<BaboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
