import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './components/slider/slider.component';
import { SlideComponent } from './components/slider/slide/slide.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';
import { VideoComponent } from './components/video/video.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [SliderComponent, SlideComponent, SearchComponent, VideoComponent],
  imports: [CommonModule, NgbModule, RouterModule, FormsModule],
  exports: [SliderComponent, SearchComponent, VideoComponent],
})
export class SharedModule {}
