import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageDetailsComponent } from './components/page-details/page-details.component';
import { PictureSliderComponent } from './components/picture-slider/picture-slider.component';
import { PictureSliderItemComponent } from './components/picture-slider/picture-slider-item/picture-slider-item.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [PageDetailsComponent, PictureSliderComponent, PictureSliderItemComponent],
  imports: [CommonModule],
  exports: [PageDetailsComponent, PictureSliderComponent],
})
export class SharedModule {}
