import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataService} from 'src/app/core/services/data.service';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NgbCarousel, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TimelineComponent} from "./timeline.component";
import { Ng5SliderModule } from 'ng5-slider';

describe('SliderComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        Ng5SliderModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        TimelineComponent
      ],
      providers: [
        DataService,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
