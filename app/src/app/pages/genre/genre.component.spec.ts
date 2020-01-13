import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GenreComponent} from './genre.component';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import { AbstractComponent } from 'src/app/shared/components/abstract/abstract.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { InformationComponent } from 'src/app/shared/components/information/information.component';
import { BadgeComponent } from 'src/app/shared/components/badge/badge.component';

describe('GenreComponent', () => {
  let component: GenreComponent;
  let fixture: ComponentFixture<GenreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        GenreComponent,
        SlideComponent,
        AbstractComponent,
        TitleComponent,
        BadgeComponent,
        InformationComponent,
        CarouselComponent,
        CollapseComponent
      ],
      providers: [
        DataService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
