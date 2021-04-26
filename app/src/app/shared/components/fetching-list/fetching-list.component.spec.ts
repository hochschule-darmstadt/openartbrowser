import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {FetchingListComponent} from './fetching-list.component';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {InViewportDirective} from 'ng-in-viewport';
import {PaginatorComponent} from './paginator/paginator.component';
import {InfiniteScrollComponent} from "../infinite-scroll/infinite-scroll.component";

describe('FetchingListComponent', () => {
  let component: FetchingListComponent;
  let fixture: ComponentFixture<FetchingListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      declarations: [
        FetchingListComponent, PaginatorComponent, InViewportDirective, InfiniteScrollComponent
      ],
      providers: [DataService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FetchingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
