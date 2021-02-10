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
import { IconclassComponent } from './components/iconclass/iconclass.component';
import { BadgeComponent } from './components/badge/badge.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { Ng5SliderModule } from 'ng5-slider';
import { CollapseComponent } from './components/collapse/collapse.component';
import { Angulartics2Module } from 'angulartics2';
import { MovementOverviewComponent } from './components/movement-overview/movement-overview.component';
import { NgxFitTextModule } from 'ngx-fit-text';
import { DimensionsComponent } from './components/dimensions/dimensions.component';
import { InfiniteScrollComponent } from './components/infinite-scroll/infinite-scroll.component';
import { FetchingListComponent } from './components/fetching-list/fetching-list.component';
import { EventTableComponent } from './components/event-table/event-table.component';
import { InViewportModule } from 'ng-in-viewport';
import { PaginatorComponent } from './components/fetching-list/paginator/paginator.component';
import { StickyTitleComponent } from './components/sticky-title/sticky-title.component';

/** Everything that should be used within multiple feature modules but isn't always required goes here */
@NgModule({
  declarations: [
    CarouselComponent,
    SlideComponent,
    SearchComponent,
    VideoComponent,
    TimelineComponent,
    BadgeComponent,
    TitleComponent,
    InformationComponent,
    AbstractComponent,
    IconclassComponent,
    DimensionsComponent,
    InfiniteScrollComponent,
    CollapseComponent,
    MovementOverviewComponent,
    FetchingListComponent,
    EventTableComponent,
    PaginatorComponent,
    StickyTitleComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    RouterModule,
    FormsModule,
    Ng5SliderModule,
    Angulartics2Module,
    NgxFitTextModule,
    InViewportModule
  ],
  exports: [
    CarouselComponent,
    SearchComponent,
    VideoComponent,
    TimelineComponent,
    BadgeComponent,
    NgbModule,
    TitleComponent,
    InformationComponent,
    AbstractComponent,
    IconclassComponent,
    CollapseComponent,
    DimensionsComponent,
    CollapseComponent,
    MovementOverviewComponent,
    InfiniteScrollComponent,
    FetchingListComponent,
    EventTableComponent,
    StickyTitleComponent,
    PaginatorComponent,
  ]
})
export class SharedModule {
}
