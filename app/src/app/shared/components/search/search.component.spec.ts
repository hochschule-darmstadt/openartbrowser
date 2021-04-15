import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import { SlideComponent } from '../carousel/slide/slide.component';
import { CarouselComponent } from '../carousel/carousel.component';

import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { SearchService } from 'src/app/core/services/search.service';
import { Angulartics2RouterlessModule } from 'angulartics2/routerlessmodule';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, FormsModule, HttpClientModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }), Angulartics2RouterlessModule.forRoot()],
      declarations: [SearchComponent, SlideComponent, CarouselComponent],
      providers: [DataService, SearchService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
