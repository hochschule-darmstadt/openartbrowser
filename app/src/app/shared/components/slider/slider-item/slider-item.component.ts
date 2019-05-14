import { Component, OnInit, Input } from '@angular/core';
import { Entity } from 'src/app/shared/models/models';

@Component({
  selector: 'app-slider-item',
  templateUrl: './slider-item.component.html',
  styleUrls: ['./slider-item.component.scss'],
})
export class SliderItemComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  @Input()
  item: Entity;
   
  highlightCommonTags(){
    this.resetTags();
    let tags = document.getElementsByClassName('common-tag');
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      const text = element.textContent.trim().toLowerCase();
  
      if (text == 'panel') { 
        element.classList.remove('badge-secondary');
        element.classList.add('badge-light');
      }
    }
  }

  resetTags(){
    let tags = document.getElementsByClassName('common-tag');
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      element.classList.remove('badge-light');
      element.classList.add('badge-secondary');
    }
  }
}
