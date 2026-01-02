import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent implements OnChanges {
  @Input()
  label: string;

  @Input()
  value: string;

  @Input()
  isHref: boolean;

  @Input()
  values: any[];

  @Input()
  isEntityPage: boolean;

  constructor() {}

  ngOnChanges() {
    this.checkRequiredFields();
  }

  /**
   * This Method is for debugging purposes.
   * Errors will not be shown in productive state.
   */
  private checkRequiredFields() {
    if (this.label === null) {
      throw new TypeError("Attribute 'label' is required");
    }
  }
}
