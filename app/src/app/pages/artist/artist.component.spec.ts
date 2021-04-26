import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {ArtistComponent} from './artist.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {VideoComponent} from 'src/app/shared/components/video/video.component';
import {BadgeComponent} from 'src/app/shared/components/badge/badge.component';
import {TimelineComponent} from 'src/app/shared/components/timeline/timeline.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import {TitleComponent} from 'src/app/shared/components/title/title.component';
import {InformationComponent} from 'src/app/shared/components/information/information.component';
import {AbstractComponent} from 'src/app/shared/components/abstract/abstract.component';
import {StickyTitleComponent} from "../../shared/components/sticky-title/sticky-title.component";
import {FetchingListComponent} from "../../shared/components/fetching-list/fetching-list.component";
import {PaginatorComponent} from "../../shared/components/fetching-list/paginator/paginator.component";
import {InViewportDirective} from "ng-in-viewport";
import {InfiniteScrollComponent} from "../../shared/components/infinite-scroll/infinite-scroll.component";

// TODO: we might want to have tests that actually test functionality
describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, HttpClientModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }), NgxSliderModule],
      declarations: [
        ArtistComponent, TimelineComponent, AbstractComponent, TitleComponent,
        InformationComponent, BadgeComponent, VideoComponent, CollapseComponent, StickyTitleComponent,
        FetchingListComponent, InViewportDirective, InfiniteScrollComponent, PaginatorComponent
      ],
      providers: [DataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
