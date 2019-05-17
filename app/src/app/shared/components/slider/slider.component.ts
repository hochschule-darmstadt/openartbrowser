import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Entity, Artwork } from '../../models/models';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnChanges {
  constructor() {}

  /**
   * @description Hook that is called when any data-bound property of a directive changes.
   * @param {SimpleChanges} changes
   * @memberof SliderComponent
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this.buildSliderPages();
    }
  }

  /**
   * @description 8 items for a single slider.
   * @type {Array<Entity[]>}
   * @memberof SliderComponent
   */
  splicedItems: Array<Entity[]> = [];

  /**
   * @description Input: the items being passed.
   * @type {Entity[]}
   * @memberof SliderComponent
   */
  @Input() items: Entity[] = [];

  /**
   * @description Input: the main artwork being passed.
   * @type {Artwork}
   * @memberof SliderComponent
   */
  @Input() artwork: Artwork;

  @Input() heading: string;

  /**
   * @description Set the items for the slider.
   * cut array of artworks in multiple arrays each with 8 items
   * arrayNumber : how many arrays with 8 items
   * sliderItems: Array<Entity[]> = [];  Is Array of arrays with 8 items each
   * temporaryArray   one array with 8 items
   * @memberof SliderComponent
   */
  buildSliderPages(): void {
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
