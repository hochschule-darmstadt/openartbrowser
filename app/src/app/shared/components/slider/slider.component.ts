import { Component, Input, SimpleChanges, OnChanges, EventEmitter, Output, ElementRef } from '@angular/core';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnChanges {
  @Input() heading: string;

  /**
   * @description Input: the items being passed.
   */
  @Input() items: Entity[] = [];

  /**
   * @description slides of the slider, max 8 items each.
   */
  slides: Array<Entity[]> = [[]];

  /**
   * @description emits hovered artwork on hover event.
   */
  @Output() itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor() { }

  /**
   * @description Hook that is called when any data-bound property of a directive changes.
   */
  ngOnChanges(changes: SimpleChanges) {
    // rebuild slides if slider items input changed.
    if (changes.items && this.items) {
      this.buildSlides();
    }
  }

  /**
   * @description Divide the slider items into slides.
   */
  buildSlides(): void {
    const slidesBuilt: Array<Entity[]> = [];
    // There are 8 images on each slide.
    const numberOfSlides = this.items.length / 8;
    for (let i = 0; i < numberOfSlides; i++) {
      const slide: Entity[] = this.items.slice(i * 8, i * 8 + 8);
      slidesBuilt.push(slide);
    }
    this.slides = slidesBuilt;
  }
}
