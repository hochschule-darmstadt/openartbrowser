import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClassComponent } from './class.component';
import { SlideComponent } from 'src/app/shared/components/carousel/slide/slide.component';
import { CarouselComponent } from 'src/app/shared/components/carousel/carousel.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InViewportDirective } from "ng-in-viewport";
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { AbstractComponent } from 'src/app/shared/components/abstract/abstract.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { InformationComponent } from 'src/app/shared/components/information/information.component';
import { BadgeComponent } from 'src/app/shared/components/badge/badge.component';
import { CollapseComponent } from 'src/app/shared/components/collapse/collapse.component';
import { StickyTitleComponent } from "../../shared/components/sticky-title/sticky-title.component";
import { FetchingListComponent } from "../../shared/components/fetching-list/fetching-list.component";
import { PaginatorComponent } from "../../shared/components/fetching-list/paginator/paginator.component";
import { InfiniteScrollComponent } from "../../shared/components/infinite-scroll/infinite-scroll.component";

describe('ClassComponent', () => {
  let component: ClassComponent;
  let fixture: ComponentFixture<ClassComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, HttpClientModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      declarations: [
        ClassComponent, SlideComponent, CarouselComponent, AbstractComponent, BadgeComponent,
        CollapseComponent, TitleComponent, InformationComponent, StickyTitleComponent,
        FetchingListComponent, InViewportDirective, InfiniteScrollComponent, PaginatorComponent
      ],
      providers: [DataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
