import { Component, OnInit, Input } from '@angular/core';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    /** Cuts big array into smaller arrays */
    this.buildSliderPages();
  }

  splicedItems: Array<Entity[]> = [];

  @Input()
  items: Entity[] = [];

  @Input()
  heading: string;

  /** Cut array of artworks in multiple arrays each with 8 items
   * arrayNumber : how many arrays with 8 items
   * sliderItems: Array<Entity[]> = [];  Is Array of arrays with 8 items each
   * temporaryArray   one array with 8 items
   */
  buildSliderPages() {
    let temporaryArray: Entity[] = [];
    let arrayNumber: number = 0;
    // There are 8 images on each slide.
    arrayNumber = this.items.length / 8;
    for (let i = 0; i < arrayNumber; i++) {
      temporaryArray = this.items.splice(0, 8);
      this.splicedItems.push(temporaryArray);
    }
  }
}
