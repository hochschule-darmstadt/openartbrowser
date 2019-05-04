import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './components/slider/slider.component';
import { SliderItemComponent } from './components/slider/slider-item/slider-item.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule} from '@angular/router';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [SliderComponent, SliderItemComponent],
  imports: [CommonModule, NgbModule, RouterModule],
  exports: [SliderComponent],
})
export class SharedModule {}
