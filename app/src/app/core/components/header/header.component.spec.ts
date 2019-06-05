import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SearchResultComponent } from 'src/app/pages/search-result/search-result.component';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from 'src/app/shared/components/slider/slider.component';
import { SlideComponent } from 'src/app/shared/components/slider/slide/slide.component';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { HttpClientModule } from '@angular/common/http';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        HeaderComponent, 
        SearchComponent, 
        SearchResultComponent,
        SlideComponent,
        SliderComponent,
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
