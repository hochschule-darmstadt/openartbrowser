import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SearchResultComponent } from 'src/app/pages/search-result/search-result.component';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from 'src/app/shared/components/carousel/carousel.component';
import { SlideComponent } from 'src/app/shared/components/carousel/slide/slide.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../services/elasticsearch/data.service';
import {Angulartics2RouterlessModule} from 'angulartics2/routerlessmodule';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        Angulartics2RouterlessModule.forRoot()
      ],
      declarations: [
        HeaderComponent,
        SearchComponent,
        SearchResultComponent,
        SlideComponent,
        CarouselComponent
      ],
      providers: [
        DataService,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
