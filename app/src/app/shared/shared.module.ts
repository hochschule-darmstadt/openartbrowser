import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PictureSliderComponent } from './components/picture-slider/picture-slider.component';
import { PictureSliderItemComponent } from './components/picture-slider/picture-slider-item/picture-slider-item.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [PictureSliderComponent, PictureSliderItemComponent],
  imports: [CommonModule],
  exports: [PictureSliderComponent],
})
export class SharedModule {}
