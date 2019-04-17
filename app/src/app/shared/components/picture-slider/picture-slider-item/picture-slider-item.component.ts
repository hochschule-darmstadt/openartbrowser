import { Component, OnInit, Input } from '@angular/core';
import { PictureSliderItem } from '../picture-slider.component';

@Component({
  selector: 'app-picture-slider-item',
  templateUrl: './picture-slider-item.component.html',
  styleUrls: ['./picture-slider-item.component.scss'],
})
export class PictureSliderItemComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  @Input()
  item: PictureSliderItem;
}
