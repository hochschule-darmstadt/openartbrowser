import { Component, OnInit, Input } from '@angular/core';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  //firstSlide: boolean;
  @Input()
  //items: Entity[];
  items: Array<Entity[]>;

}
