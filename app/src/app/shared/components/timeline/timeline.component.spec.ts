import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimelineComponent } from './timeline.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EntityType, EntityIcon } from '../../models/models';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { HammerConfig } from 'src/config/hammer.config';

describe('SliderComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, NgxSliderModule, HttpClientModule, RouterModule.forRoot([], {}), BrowserAnimationsModule],
      declarations: [TimelineComponent],
      providers: [
        DataService,
        {
          provide: HAMMER_GESTURE_CONFIG,
          useClass: HammerConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create without items', () => {
    expect(component).toBeTruthy();
  });

  it('should create with items', () => {
    component.items = [
      {
        id: 'Q18578798',
        label: 'The Execution of the Four Crowned Martyrs',
        description: 'painting by Niccolò di Pietro Gerini',
        type: EntityType.ARTWORK,
        icon: EntityIcon.ARTWORK,
        route: '',
        absoluteRank: 37,
        relativeRank: 0.9795063116489386,
        date: 1300,
      },
      {
        id: 'Q549172',
        label: 'Flight into Egypt',
        description: 'fresco by Giotto',
        type: EntityType.ARTWORK,
        icon: EntityIcon.ARTWORK,
        route: '',
        absoluteRank: 46,
        relativeRank: 0.9944890206318238,
        date: 1305,
      },
      {
        id: 'Q979440',
        label: 'Annunciation with St. Margaret and St. Ansanus',
        description: 'painting by Simone Martini and Lippo Memmi',
        type: EntityType.ARTWORK,
        icon: EntityIcon.ARTWORK,
        route: '',
        absoluteRank: 36,
        relativeRank: 0.9762525340301427,
        date: 1333,
      },
      {
        id: 'Q3815314',
        label: 'Head of Christ',
        description: 'sculpture by Jaume Cascalls',
        abstract: 'The Head of Christ is a Jesus head conserved at the National Art Museum of Catalonia.',
        type: EntityType.ARTWORK,
        icon: EntityIcon.ARTWORK,
        route: '',
        absoluteRank: 21,
        relativeRank: 0.22987683344390347,
        date: 1352,
      },
    ];
    expect(component).toBeTruthy();
  });
});
