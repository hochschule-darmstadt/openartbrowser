import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SliderComponent} from './components/slider/slider.component';
import {SlideComponent} from './components/slider/slide/slide.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {SearchComponent} from './components/search/search.component';
import {FormsModule} from '@angular/forms';
import {TimelineComponent} from "./components/timeline/timeline.component";
import {Ng5SliderModule} from "ng5-slider";

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [SliderComponent, SlideComponent, SearchComponent, TimelineComponent],
  imports: [CommonModule, NgbModule, RouterModule, FormsModule, Ng5SliderModule],
  exports: [SliderComponent, SearchComponent, TimelineComponent],
})
export class SharedModule {
}
