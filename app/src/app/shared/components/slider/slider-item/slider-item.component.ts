import { Component, OnInit, Input } from '@angular/core';
import { Entity, Artwork } from 'src/app/shared/models/models';

@Component({
  selector: 'app-slider-item',
  templateUrl: './slider-item.component.html',
  styleUrls: ['./slider-item.component.scss'],
})
export class SliderItemComponent implements OnInit {
  constructor() { }

  ngOnInit() { }

  /**
   * @description Input: the item being passed.
   * @type {Entity}
   * @memberof SliderItemComponent
   */
  @Input() item: Entity;
}
