import {Component, Input, SimpleChanges, OnChanges, EventEmitter, Output} from '@angular/core';
import {Entity} from '../../models/models';

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
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnChanges {

  /** title of this slider */
  @Input() heading: string;

  /**  entities that should be displayed in this slider */
  @Input() items: Entity[] = [];

  // slides of the slider, max 8 items each.
  slides: Slide[];

  /** emits hovered artwork on hover event. */
  @Output() itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor() {
  }

  /** Hook that is called when any data-bound property of a directive changes. */
  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    if (changes.items && this.items) {
      this.buildSlides();
    }
  }

  /** Divide the slider items into slides. Initialize slides. */
  buildSlides(): void {
    const slidesBuilt: Slide[] = [];
    // There are 8 images on each slide.
    const numberOfSlides = this.items.length / 8;
    for (let i = 0; i < numberOfSlides; i++) {
      // get next 8 items out of items array
      const items: Entity[] = this.items.slice(i * 8, i * 8 + 8);

      const slide: Slide = makeDefaultSlide(i, items);

      if (i === numberOfSlides - 1) {
        slide.isLastSlide = true;
      }
      if (i === 0) {
        slide.isFirstSlide = true;
      }

      /** set pointers between this slide and previous slide  */
      if (i !== 0) {
        slide.prevSlide = slidesBuilt[i - 1];
        slidesBuilt[i - 1].nextSlide = slide;
      }

      /** if this is the last slide, also set pointers between first and last slide  */
      if (i === numberOfSlides - 1 && numberOfSlides !== 1) {
        slide.nextSlide = slidesBuilt[0];
        slidesBuilt[0].prevSlide = slide;
      }

      slidesBuilt.push(slide);
    }
    this.slides = slidesBuilt;
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
}
