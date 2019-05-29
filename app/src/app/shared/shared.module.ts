import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './components/slider/slider.component';
import { SliderItemComponent } from './components/slider/slider-item/slider-item.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [SliderComponent, SliderItemComponent, SearchComponent],
  imports: [CommonModule, NgbModule, RouterModule, FormsModule],
  exports: [SliderComponent, SearchComponent],
})
export class SharedModule {}
