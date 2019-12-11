import {Component, OnInit} from '@angular/core';
import {Angulartics2GoogleAnalytics} from 'angulartics2/ga';
import {AnalyticsService} from '../../services/analytics.service';

@Component({
  selector: 'app-consent-dialog',
  templateUrl: './consent-dialog.component.html',
  styleUrls: ['./consent-dialog.component.scss']
})
export class ConsentDialogComponent implements OnInit {
  closed = true;

  constructor(public analytics: Angulartics2GoogleAnalytics) {
  }

  ngOnInit() {
    if (!document.cookie.includes('openArtBrowserCookieConsent')) {
      this.closed = false;
    } else {
      this.startTracking();
    }
  }

  consent() {
    document.cookie = 'openArtBrowserCookieConsent=1';
    this.closed = true;
    this.startTracking();
  }

  startTracking() {
    AnalyticsService.setTrackingId();
    this.analytics.startTracking();
  }

}
