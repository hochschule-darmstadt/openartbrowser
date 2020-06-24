import {Component, Input, OnInit} from '@angular/core';
import {SignificantEvent} from '../../models/artwork.interface';

@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.scss']
})
export class EventTableComponent implements OnInit {
  @Input()
  events: SignificantEvent[];

  constructor() { }

  ngOnInit() {
  }

  isDisplayable(event) {
    return typeof event.start_time === 'number' && event.label.length
  }

  getTimeLabel(event) {
    if (event.end_time && event.end_time !== event.start_time) {
      return event.start_time + ' - ' + event.end_time;
    }
    return event.start_time;
  }

  getEventLabel(event) {
    if (event.type === 'exhibition' && !event.description) {
      return event.label + ' (Exhibition)';
    }
    return event.label;
  }

  getEventDescription(event) {
    if (event.type === 'exhibition') {
      return event.description;
    }
  }

}
