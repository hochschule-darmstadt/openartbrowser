import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ArtistComponent} from './artist.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {VideoComponent} from 'src/app/shared/components/video/video.component';
import {BadgeComponent} from 'src/app/shared/components/badge/badge.component';
import {TimelineComponent} from 'src/app/shared/components/timeline/timeline.component';
import {Ng5SliderModule} from 'ng5-slider';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';

describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        Ng5SliderModule,
      ],
      declarations: [
        ArtistComponent,
        SlideComponent,
        CarouselComponent,
        TimelineComponent,
        BadgeComponent,
        VideoComponent,
        CollapseComponent
      ],
      providers: [
        DataService,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
