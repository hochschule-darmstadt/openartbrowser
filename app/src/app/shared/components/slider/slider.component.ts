import {Component, Input, SimpleChanges, OnChanges, EventEmitter, Output, ViewChild, ElementRef} from '@angular/core';
import {Entity} from '../../models/models';
import {NgbCarousel} from "@ng-bootstrap/ng-bootstrap";

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

  /** displayed items once at a time */
  @Input() displayed_items: number = 8;

  // slides of the slider, max x items each.
  slides: Slide[];

  @Output() onSlideChangedCallback = new EventEmitter<any>();

  @ViewChild(NgbCarousel)
  carousel: NgbCarousel;

  /** emits hovered artwork on hover event. */
  @Output() itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor(private elRef: ElementRef) {
  }

  /** Hook that is called when any data-bound property of a directive changes. */
  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    if (changes.items && this.items) {
      this.buildSlides();
    }
    let nextButton = this.elRef.nativeElement.querySelector(".carousel-control-next");
    let prevButton = this.elRef.nativeElement.querySelector(".carousel-control-prev");
    if (nextButton !== null && prevButton !== null) {
      nextButton.addEventListener('click', this.onClickNext.bind(this));
      prevButton.addEventListener('click', this.onClickPrev.bind(this));
    }
  }

  /** Divide the slider items into slides. Initialize slides. */
  buildSlides(): void {
    const slidesBuilt: Slide[] = [];
    // There are x images on each slide.
    const numberOfSlides = this.items.length / this.displayed_items;
    for (let i = 0; i < numberOfSlides; i++) {
      // get next x items out of items array
      const items: Entity[] =
        this.items.slice(i * +this.displayed_items, i * +this.displayed_items + +this.displayed_items);

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

  public onSlideChanged(slideData) {
    let carouselFirstId = this.carousel.slides.toArray()[0].id;
    let carouselLastId = this.carousel.slides.toArray().pop().id;
    // trigger on last slide
    if (this.carousel.activeId === carouselFirstId && slideData["direction"] === "right") {
      this.onSlideChangedCallback.emit(-1)
    } else if (this.carousel.activeId === carouselLastId && slideData["direction"] === "left") {
      this.onSlideChangedCallback.emit(+1)
    }
  }

  onClickNext() {
    if (this.carousel.slides.length === 1) {
      this.onSlideChangedCallback.emit(1)
    }
  }

  onClickPrev() {
    if (this.carousel.slides.length === 1) {
      this.onSlideChangedCallback.emit(-1)
    }
  }
}
