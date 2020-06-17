import {Component, Input, OnInit} from '@angular/core';
import {SignificantEvent} from "../../models/artwork.interface";

@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.scss']
})
export class EventTableComponent implements OnInit {
  @Input()
  values: SignificantEvent[];

  constructor() { }

  ngOnInit() {
  }

}
