import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SignificantEvent } from '../../models/artwork.interface';

@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.scss']
})
export class EventTableComponent implements OnChanges {
  @Input()
  label: string;

  @Input()
  events: SignificantEvent[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.events) {
      this.events = changes.events.currentValue.filter(this.isDisplayable);
    }
  }

  isDisplayable(event) {
    return typeof event.start === 'number' && event.label.length;
  }

  getTimeLabel(event) {
    if (event.end && event.end !== event.start) {
      return event.start + ' - ' + event.end;
    }
    return event.start;
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
