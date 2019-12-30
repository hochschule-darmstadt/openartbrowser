import { Component, OnInit, Input } from '@angular/core';
import { Entity } from '../../models/models';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss']
})
export class TitleComponent implements OnInit {

  @Input() entity: Entity;

  constructor() { }

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
