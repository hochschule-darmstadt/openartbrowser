import { Component, OnInit, Input } from '@angular/core';
import { Entity } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-slider-item',
  templateUrl: './slider-item.component.html',
  styleUrls: ['./slider-item.component.scss'],
})
export class SliderItemComponent implements OnInit {
  constructor(public dataService: DataService) { }

  ngOnInit() { }

  /**
   * @description Input: the item being passed.
   * @type {Entity}
   * @memberof SliderItemComponent
   */
  @Input() item: Entity;
}
