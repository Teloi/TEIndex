import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BmessageComponent } from './bmessage.component';

describe('BmessageComponent', () => {
  let component: BmessageComponent;
  let fixture: ComponentFixture<BmessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BmessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
