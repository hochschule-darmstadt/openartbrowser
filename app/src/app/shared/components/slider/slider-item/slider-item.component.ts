import { Component, OnInit, Input } from '@angular/core';
import { Entity, Artwork } from 'src/app/shared/models/models';

@Component({
  selector: 'app-slider-item',
  templateUrl: './slider-item.component.html',
  styleUrls: ['./slider-item.component.scss'],
})
export class SliderItemComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  /**
   * @description Input: the item being passed.
   * @type {Entity}
   * @memberof SliderItemComponent
   */
  @Input() item: Entity;

  /**
   * @description Input: the main artwork being passed.
   * @type {Artwork}
   * @memberof SliderItemComponent
   */
  @Input() artwork: Artwork;

  /**
   * @description Highlighting common tags between the slider item and current artwork
   * @memberof SliderItemComponent
   */
  highlightCommonTags(): void {
    this.resetTags(); //reset tags style to default
    let fetchTagsClass = 'common-tag';
    let tags = document.getElementsByClassName(fetchTagsClass);
    /** available metadatas to check in artwork item*/
    let type = ['creators', 'movements', 'locations', 'materials', 'genres', 'motifs'];
    /** Loop through all current artwork tags */
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      const text = element.textContent.trim().toLowerCase();


      /** Check if current tag has the same tag with the slider item by looping through every available metadata */
      for (let t of type) {
        let attributes = this.item[t];
        if (attributes) {
          for (let tag of attributes) {
            if (text == tag.toLowerCase()) {
              element.classList.remove('badge-secondary');
              element.classList.remove('badge-transparent');
              element.classList.add('badge-light');
              break; //if found, break the loop
            } else {
              element.classList.add('badge-transparent');
            }
          }
        } else {
          if(element.classList.contains('badge-secondary')){
            element.classList.add('badge-transparent');
          }
        }
      }
    }
  }

  /**
   * @description Reset tags style
   * @memberof SliderItemComponent
   */
  resetTags(): void {
    let tags = document.getElementsByClassName('common-tag');
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      element.classList.remove('badge-light');
      element.classList.remove('badge-transparent');
      element.classList.add('badge-secondary');
    }
  }
}
