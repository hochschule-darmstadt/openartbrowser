import { Component, OnInit } from '@angular/core';
import {AnalyticsProperty} from '../../../environments/environment_analytics';

@Component({
  selector: 'app-data-protection',
  templateUrl: './data-protection.component.html',
  styleUrls: ['./data-protection.component.scss']
})
export class DataProtectionComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  gaOptout() {
    const disableStr = 'ga-disable-' + AnalyticsProperty.trackingId;
    document.cookie = disableStr + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    window[disableStr] = true;
    alert('Das Tracking ist jetzt deaktiviert');
  }

}
