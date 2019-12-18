import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from './components/carousel/carousel.component';
import { SlideComponent } from './components/carousel/slide/slide.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { FormsModule } from '@angular/forms';
import { VideoComponent } from './components/video/video.component';
import { InformationComponent } from './components/information/information.component';
import { AbstractComponent } from './components/abstract/abstract.component';
import { TitleComponent } from './components/title/title.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [CarouselComponent, SlideComponent, SearchComponent, VideoComponent, InformationComponent, AbstractComponent, TitleComponent],
  imports: [CommonModule, NgbModule, RouterModule, FormsModule],
  exports: [CarouselComponent, SearchComponent, VideoComponent, InformationComponent, AbstractComponent, TitleComponent],
})
export class SharedModule {}
