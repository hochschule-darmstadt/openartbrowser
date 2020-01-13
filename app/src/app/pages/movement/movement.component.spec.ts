import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MovementComponent} from './movement.component';
import {SlideComponent} from 'src/app/shared/components/carousel/slide/slide.component';
import {CarouselComponent} from 'src/app/shared/components/carousel/carousel.component';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TimelineComponent} from 'src/app/shared/components/timeline/timeline.component';
import {VideoComponent} from 'src/app/shared/components/video/video.component';
import {Ng5SliderModule} from 'ng5-slider';
import {BadgeComponent} from 'src/app/shared/components/badge/badge.component';
import {CollapseComponent} from 'src/app/shared/components/collapse/collapse.component';
import {Angulartics2RouterlessModule} from 'angulartics2/routerlessmodule';

describe('MovementComponent', () => {
  let component: MovementComponent;
  let fixture: ComponentFixture<MovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        Ng5SliderModule,
        RouterModule.forRoot([]),
        Angulartics2RouterlessModule.forRoot()
      ],
      declarations: [
        MovementComponent,
        SlideComponent,
        TimelineComponent,
        BadgeComponent,
        CarouselComponent,
        VideoComponent,
        CollapseComponent
      ],
      providers: [
        DataService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
