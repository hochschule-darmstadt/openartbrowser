import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LocationComponent} from './location.component';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import { AbstractComponent } from 'src/app/shared/components/abstract/abstract.component';
import { InformationComponent } from 'src/app/shared/components/information/information.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        LocationComponent,
        SlideComponent,
        CarouselComponent,
        CollapseComponent,
        AbstractComponent,
        TitleComponent,
        InformationComponent
      ],
      providers: [
        DataService,
      ]
    })
      .compileComponents();
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
