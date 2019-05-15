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

  @Input()
  type: string;

  @Input()
  item: Entity;

  @Input()
  artwork: Artwork;
   
  /** Highlighting common tags between the slider item and current artwork */
  highlightCommonTags(){
    this.resetTags(); //reset tags style to default
    let fetchTagsClass = this.type == 'all' ? 'common-tag' : this.type + '-tag';
    let tags = document.getElementsByClassName(fetchTagsClass);
    /** Loop through all current artwork tags */
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      const text = element.textContent.trim().toLowerCase();
      
      /** Check if current tag has the same tag with the slider item */
      let attributes = this.item[this.type];
      if (attributes){
        for (let tag of attributes){
          if (text == tag.toLowerCase()) { 
            element.classList.remove('badge-secondary');
            element.classList.remove('badge-transparent');
            element.classList.add('badge-light');
            break; //if found, break the loop
          } else {
            element.classList.add('badge-transparent');
          }
        }
      }
    }
  }

  /** Reset tags style */
  resetTags(){
    let tags = document.getElementsByClassName('common-tag');
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      element.classList.remove('badge-light');
      element.classList.remove('badge-transparent');
      element.classList.add('badge-secondary');
    }
  }
}
