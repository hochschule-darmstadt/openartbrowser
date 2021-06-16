import { Component, Input, SimpleChanges, OnChanges, EventEmitter, Output } from '@angular/core';
import { Entity } from '../../models/models';
import { HostListener } from '@angular/core';
import { HammerGestureConfig } from "@angular/platform-browser";
import * as hammer from "hammerjs";
import {TimelineComponent} from 'src/app/shared/components/timeline/timeline.component';

export interface Slide {
  /** artworks displayed on this slide */
  items: Entity[];
  /** previous slide of slider */
  prevSlide: Slide;
  /** next slide of slider */
  nextSlide: Slide;
  /**  whether slide images should be loaded */
  loadContent: boolean;
  /** flag if this is the last slide of the slider */
  isLastSlide: boolean;
  /** flag if this is the first slide of the slider */
  isFirstSlide: boolean;
  /** slide id to uniquely identify slide within this slider */
  id: number;
}

/**
 * In order to test the Slide component individually
 * we need a default slide that can be passed to it
 *
 * @returns {Slide} a default slide
 */
export function makeDefaultSlide(id: number = 0, items: Array<Entity> = []): Slide {
  return {
    id,
    items,
    isFirstSlide: false,
    isLastSlide: false,
    nextSlide: null,
    prevSlide: null,
    loadContent: null
  };
}

@Component({
  selector: 'app-slider',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnChanges {
  overrides = <any>{
    swipe: { direction: hammer.DIRECTION_HORIZONTAL },
    pinch: { enable: false },
    rotate: { enable: false }
  };
  /** title of this slider */
  @Input() heading: string;

  /**  entities that should be displayed in this slider */
  @Input() items: Entity[] = [];

  // slides of the slider, max 8 items each.
  slides: Slide[];

  private isMobile = false;

  /** emits hovered artwork on hover event. */
  @Output() itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor() {
    this.checkIsMobile();
  }

  /** Hook that is called when any data-bound property of a directive changes. */
  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    if (changes.items && this.items) {
      // Slice items to max 20 related artworks when mobile
      this.slides = this.buildSlides(this.isMobile ? this.items.slice(0, 20) : this.items);
    }
  }

  /** Divide the slider items into slides. Initialize slides. */
  private buildSlides(items: Entity[]): Slide[] {
    const slides: Slide[] = [];
    // There are 8 images on each slide.
    // There are 1 image on each slide if is  mobile
    const imagesPerSlide = this.isMobile ? 1 : 8;
    const numberOfSlides = items.length / imagesPerSlide;

    for (let i = 0; i < numberOfSlides; i++) {
      // get next imagesPerSlide items out of items array
      const slideItems: Entity[] = items.slice(i * imagesPerSlide, i * imagesPerSlide + imagesPerSlide);

      const slide: Slide = makeDefaultSlide(i, slideItems);

      if (i === numberOfSlides - 1) {
        slide.isLastSlide = true;
      }
      if (i === 0) {
        slide.isFirstSlide = true;
      }

      /** set pointers between this slide and previous slide  */
      if (i !== 0) {
        slide.prevSlide = slides[i - 1];
        slides[i - 1].nextSlide = slide;
      }

      /** if this is the last slide, also set pointers between first and last slide  */
      if (i === numberOfSlides - 1 && numberOfSlides !== 1) {
        slide.nextSlide = slides[0];
        slides[0].prevSlide = slide;
      }

      slides.push(slide);
    }
    return slides;
  }

  /** delete slide based on id of the passed slide
   * @param slide slide to be deleted
   */
  deleteUnusedSlides() {
    const lastSlide = this.slides[this.slides.length - 1];
    if (lastSlide.items.length === 0) {
      if (!lastSlide.isFirstSlide) {
        lastSlide.prevSlide.isLastSlide = true;
        lastSlide.prevSlide.nextSlide = null;
      }
      this.slides.splice(this.slides.length - 1, 1);
    }
  }

  @HostListener('window:resize', ['$event'])
  checkIsMobile(event?) {
    this.isMobile = window.innerWidth < 575;
  }
}
