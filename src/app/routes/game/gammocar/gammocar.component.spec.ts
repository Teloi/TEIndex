import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GammocarComponent } from './gammocar.component';

describe('GammocarComponent', () => {
  let component: GammocarComponent;
  let fixture: ComponentFixture<GammocarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GammocarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GammocarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
