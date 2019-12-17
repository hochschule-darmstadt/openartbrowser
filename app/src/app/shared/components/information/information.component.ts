import { Component, OnInit, Input } from '@angular/core';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  @Input()
  label: String;

  @Input()
  icon: String;

  @Input()
  value: String;

  @Input()
  values: Entity[];

  @Input()
  route: String;


  constructor() { }

  ngOnInit() {
    this.checkRequiredFields();
  }

  ngOnChanges(changes) {
    this.checkRequiredFields();
  }

  private checkRequiredFields() {
    if (this.label === null) {
      throw new TypeError("Attribute 'label' is required");
    }
  }

}
