import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BphotoComponent } from './bphoto.component';

describe('BphotoComponent', () => {
  let component: BphotoComponent;
  let fixture: ComponentFixture<BphotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BphotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BphotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
