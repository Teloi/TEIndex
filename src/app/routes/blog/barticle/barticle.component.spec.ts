import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarticleComponent } from './barticle.component';

describe('BarticleComponent', () => {
  let component: BarticleComponent;
  let fixture: ComponentFixture<BarticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
