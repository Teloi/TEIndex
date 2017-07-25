import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BclassifyComponent } from './bclassify.component';

describe('BclassifyComponent', () => {
  let component: BclassifyComponent;
  let fixture: ComponentFixture<BclassifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BclassifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BclassifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
