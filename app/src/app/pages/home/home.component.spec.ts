import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { SearchResultComponent } from '../search-result/search-result.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from 'src/app/shared/components/carousel/carousel.component';
import { SlideComponent } from 'src/app/shared/components/carousel/slide/slide.component';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        HomeComponent,
        SearchComponent,
        SearchResultComponent,
        CarouselComponent,
        SlideComponent
      ],
      providers: [
        DataService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
