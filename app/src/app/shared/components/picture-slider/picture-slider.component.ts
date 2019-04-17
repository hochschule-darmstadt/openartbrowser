import { Component, OnInit, Input } from '@angular/core';

export interface PictureSliderItem {
  picture: string;
  label: string;
}

@Component({
  selector: 'app-picture-slider',
  templateUrl: './picture-slider.component.html',
  styleUrls: ['./picture-slider.component.scss'],
})
export class PictureSliderComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  @Input()
  items: PictureSliderItem[];
}
