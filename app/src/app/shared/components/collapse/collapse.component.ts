import { Component, Input, OnInit } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent implements OnInit {
  /** Change collapse icon; true if more infos are folded in */
  @Input() collapse = true;

  @Input() showVideo = false;

  @Input() heading = 'More';

  constructor(private angulartics2: Angulartics2) {}

  ngOnInit() {}

  toggle() {
    this.collapse = !this.collapse;

    // Track event in usage analytics
    this.angulartics2.eventTrack.next({
      action: this.collapse ? 'closed' : 'opened',
      properties: { category: 'More section' }
    });
  }
}
