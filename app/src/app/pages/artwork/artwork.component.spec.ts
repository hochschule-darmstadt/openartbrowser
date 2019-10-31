import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkComponent } from './artwork.component';
import { SlideComponent } from 'src/app/shared/components/slider/slide/slide.component';
import { SliderComponent } from 'src/app/shared/components/slider/slider.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/core/services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { ImageViewerModule } from 'ngx-image-viewer';
import { RouterModule } from '@angular/router';
import { VideoComponent} from "../../shared/components/video/video.component";

describe('ArtworkComponent', () => {
  let component: ArtworkComponent;
  let fixture: ComponentFixture<ArtworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        ImageViewerModule.forRoot(),
        RouterModule.forRoot([])
      ],
      declarations: [
        ArtworkComponent,
        SlideComponent,
        SliderComponent,
        VideoComponent
      ],
      providers: [
        DataService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
