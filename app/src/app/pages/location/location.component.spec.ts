import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {LocationComponent} from './location.component';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import {AbstractComponent} from 'src/app/shared/components/abstract/abstract.component';
import {InformationComponent} from 'src/app/shared/components/information/information.component';
import {TitleComponent} from 'src/app/shared/components/title/title.component';
import {BadgeComponent} from 'src/app/shared/components/badge/badge.component';
import {StickyTitleComponent} from "../../shared/components/sticky-title/sticky-title.component";
import {FetchingListComponent} from "../../shared/components/fetching-list/fetching-list.component";
import {PaginatorComponent} from "../../shared/components/fetching-list/paginator/paginator.component";
import {InViewportDirective} from "ng-in-viewport";
import {InfiniteScrollComponent} from "../../shared/components/infinite-scroll/infinite-scroll.component";

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, HttpClientModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      declarations: [
        LocationComponent, SlideComponent, CarouselComponent, CollapseComponent, BadgeComponent,
        AbstractComponent, TitleComponent, InformationComponent, StickyTitleComponent,
        FetchingListComponent, InViewportDirective, InfiniteScrollComponent, PaginatorComponent
      ],
      providers: [DataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
