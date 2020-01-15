import { Component, Input, OnInit } from "@angular/core";
import { Entity } from "../../models/models";

@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  styleUrls: ["./badge.component.scss"]
})
export class BadgeComponent implements OnInit {
  @Input()
  entity: Entity;

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
