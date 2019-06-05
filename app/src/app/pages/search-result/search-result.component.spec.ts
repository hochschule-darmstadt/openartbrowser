import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultComponent } from './search-result.component';
import { SlideComponent } from 'src/app/shared/components/slider/slide/slide.component';
import { SliderComponent } from 'src/app/shared/components/slider/slider.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/core/services/data.service';
import { HttpClientModule } from '@angular/common/http';

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        SearchResultComponent,
        SlideComponent,
        SliderComponent
      ],
      providers: [
        DataService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
