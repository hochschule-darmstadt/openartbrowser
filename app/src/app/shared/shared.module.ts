import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './components/slider/slider.component';
import { SliderItemComponent } from './components/slider/slider-item/slider-item.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [SliderComponent, SliderItemComponent],
  imports: [CommonModule],
  exports: [SliderComponent],
})
export class SharedModule {}
