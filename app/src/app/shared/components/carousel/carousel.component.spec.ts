import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarouselComponent } from './carousel.component';
import { SlideComponent } from './slide/slide.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

describe('SliderComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, HttpClientModule, RouterModule.forRoot([], {})],
      declarations: [CarouselComponent, SlideComponent],
      providers: [{
        provide: HAMMER_GESTURE_CONFIG,
        useClass: CarouselComponent
      }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
