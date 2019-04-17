import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureSliderItemComponent } from './picture-slider-item.component';

describe('PictureSliderItemComponent', () => {
  let component: PictureSliderItemComponent;
  let fixture: ComponentFixture<PictureSliderItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureSliderItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureSliderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
