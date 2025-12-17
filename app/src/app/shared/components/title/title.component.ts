import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Entity } from '../../models/models';
import { usePlural } from '../../models/entity.interface';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})
export class TitleComponent implements OnInit, OnChanges {
  @Input() entity: Entity;
  
  usePlural = usePlural;

  constructor() {}

  ngOnInit() {
    this.checkRequiredFields();
  }

  ngOnChanges(changes) {
    this.checkRequiredFields();
  }

  private checkRequiredFields() {
    if (this.entity === null) {
      throw new TypeError("Attribute 'entity' is required");
    }
  }
}
