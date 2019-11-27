import {Component, Input, Output, EventEmitter, AfterViewInit, ElementRef} from '@angular/core';
import {Entity} from 'src/app/shared/models/models';
import {DataService} from 'src/app/core/services/data.service';
import {Slide, makeDefaultSlide} from '../slider.component';

/**
 * a slide of the slider.
 * if the image of an item cannot be loaded due to invalid url, the item is removed from the slider
 * and all following items move one position to the left to fill the gap.
 */
@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements AfterViewInit {
  /** the slide that should be displayed */
  @Input() slide: Slide = makeDefaultSlide();

  //@Output() itemDataEmitter: EventEmitter<any> = new EventEmitter<Entity>();
 // @Input() itemDataGetter: Function;
  /** emits hovered artwork on item hover event */
  @Output()
  itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  /** trigger deletion of unused slides in slider component */
  @Output()
  deleteUnusedSlides: EventEmitter<void> = new EventEmitter<void>();

  constructor(public dataService: DataService, private el: ElementRef) {
  }

  ngAfterViewInit() {
    if (window && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          /** check whether any element of the slide is currently visible on screen */
          entries.forEach(({isIntersecting}) => {
            if (isIntersecting) {
              /** enable image loading for this slide, the next slide and the previous slide if slide is visible */
              this.slide.loadContent = true;
              if (this.slide.nextSlide) {
                this.slide.nextSlide.loadContent = true;
              }
              if (this.slide.prevSlide) {
                this.slide.prevSlide.loadContent = true;
              }
              obs.unobserve(this.el.nativeElement);
            }
          });
        },
        {rootMargin: '100%'}
      );
      obs.observe(this.el.nativeElement);
    } else {
      this.slide.loadContent = true;
    }
  }

  /** if image of an item could not be loaded, shift succeeding items from this slide and following slides
   * one position to the left. if the last slide becomes empty during this process, delete the last slide.
   * @param item the item whose image could not be loaded
   **/
  onLoadingError(item: Entity) {
    const removeIndex = this.slide.items.findIndex((i) => {
      return i.id === item.id;
    });

    this.slide.items.splice(removeIndex, 1);

    const newItem = this.shiftItemForward(this.slide.nextSlide);
    if (newItem) {
      this.slide.items.push(newItem);
    }

    if (this.slide.items.length === 0) {
      this.deleteUnusedSlides.emit();
    }
  }

  /**
   * removes the first item from this slide and shift succeeding items from this slide and following slides
   * one position to the left.
   * @param slide slide of which first item should be shifted to the previous slide
   */
  shiftItemForward(slide: Slide) {
    if (!slide) {
      return null;
    }

    if (!slide.isLastSlide) {
      const newItem = this.shiftItemForward(slide.nextSlide);
      if (newItem) {
        slide.items.push(newItem);
      }
    }

    const returnedItem = slide.items.splice(0, 1)[0];
    if (slide.items.length === 0) {
      this.deleteUnusedSlides.emit();
    }
    return returnedItem;
  }
}
