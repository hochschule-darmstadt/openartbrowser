import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureSliderComponent } from './picture-slider.component';

describe('PictureSliderComponent', () => {
  let component: PictureSliderComponent;
  let fixture: ComponentFixture<PictureSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
