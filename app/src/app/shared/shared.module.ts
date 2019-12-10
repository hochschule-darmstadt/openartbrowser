import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CarouselComponent} from './components/carousel/carousel.component';
import {SlideComponent} from './components/carousel/slide/slide.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {SearchComponent} from './components/search/search.component';
import {FormsModule} from '@angular/forms';
import {VideoComponent} from './components/video/video.component';
import {TimelineComponent} from "./components/timeline/timeline.component";
import {Ng5SliderModule} from "ng5-slider";

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [CarouselComponent, SlideComponent, SearchComponent, VideoComponent, TimelineComponent],
  imports: [CommonModule, NgbModule, RouterModule, FormsModule, Ng5SliderModule],
  exports: [CarouselComponent, SearchComponent, VideoComponent, TimelineComponent],
})
export class SharedModule {
}
