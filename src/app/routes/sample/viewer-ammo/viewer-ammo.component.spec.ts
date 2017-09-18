import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerAmmoComponent } from './viewer-ammo.component';

describe('ViewerAmmoComponent', () => {
  let component: ViewerAmmoComponent;
  let fixture: ComponentFixture<ViewerAmmoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerAmmoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerAmmoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
