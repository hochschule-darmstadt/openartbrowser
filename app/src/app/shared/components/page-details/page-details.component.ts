import { Component, OnInit, Input } from '@angular/core';

export interface PageDetailsDataField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['./page-details.component.scss'],
})
export class PageDetailsComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    console.log(this.imageUrl);
  }

  /** fields that will be displayed as entity meta data */
  @Input()
  dataFields: PageDetailsDataField[] = [];

  /** name of the entity that is displayed  */
  @Input()
  heading: string = '';

  /** image of entity  */
  @Input()
  imageUrl: string = '';
}
