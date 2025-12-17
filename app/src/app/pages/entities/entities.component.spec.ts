import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {EntitiesComponent} from './entities.component';
import {DataService} from '../../core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {FetchingListComponent} from '../../shared/components/fetching-list/fetching-list.component';
import {InViewportModule} from "ng-in-viewport";
import {InfiniteScrollComponent} from "../../shared/components/infinite-scroll/infinite-scroll.component";
import {PaginatorComponent} from "../../shared/components/fetching-list/paginator/paginator.component";
import {StickyTitleComponent} from "../../shared/components/sticky-title/sticky-title.component";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";

describe('EntitiesComponent', () => {
  let component: EntitiesComponent;
  let fixture: ComponentFixture<EntitiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([], {}), InViewportModule, NgbTooltip],
      declarations: [
        EntitiesComponent, FetchingListComponent, PaginatorComponent,
        InfiniteScrollComponent, StickyTitleComponent
      ],
      providers: [
        DataService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
