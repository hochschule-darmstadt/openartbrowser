import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {MovementComponent} from './movement.component';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TimelineComponent} from 'src/app/shared/components/timeline/timeline.component';
import {VideoComponent} from 'src/app/shared/components/video/video.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import {BadgeComponent} from 'src/app/shared/components/badge/badge.component';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import {InformationComponent} from 'src/app/shared/components/information/information.component';
import {TitleComponent} from 'src/app/shared/components/title/title.component';
import {AbstractComponent} from 'src/app/shared/components/abstract/abstract.component';
import {Angulartics2RouterlessModule} from 'angulartics2/routerlessmodule';
import {MovementOverviewComponent} from '../../shared/components/movement-overview/movement-overview.component';
import {StickyTitleComponent} from "../../shared/components/sticky-title/sticky-title.component";
import {FetchingListComponent} from "../../shared/components/fetching-list/fetching-list.component";
import {PaginatorComponent} from "../../shared/components/fetching-list/paginator/paginator.component";
import {InViewportDirective} from "ng-in-viewport";
import {InfiniteScrollComponent} from "../../shared/components/infinite-scroll/infinite-scroll.component";

describe('MovementComponent', () => {
  let component: MovementComponent;
  let fixture: ComponentFixture<MovementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        NgxSliderModule,
        RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
        Angulartics2RouterlessModule.forRoot(),
      ],
      declarations: [
        MovementComponent, MovementOverviewComponent, SlideComponent, TimelineComponent, BadgeComponent,
        CarouselComponent, AbstractComponent, TitleComponent, InformationComponent, VideoComponent,
        CollapseComponent, StickyTitleComponent,
        FetchingListComponent, InViewportDirective, InfiniteScrollComponent, PaginatorComponent
      ],
      providers: [DataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
