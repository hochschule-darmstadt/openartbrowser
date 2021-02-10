import { Component, Directive, OnInit } from '@angular/core';
import { Angulartics2Piwik } from 'angulartics2/piwik';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    _paq: any;
  }
}

@Component({
  selector: 'app-analytics',
  template: ''
})
export class AnalyticsComponent implements OnInit {
  constructor(public analytics: Angulartics2Piwik) {
    if (environment.analytics.enabled) {
      const _paq = window._paq || [];
      _paq.push(['disableCookies']);
      _paq.push(['setTrackerUrl', environment.analytics.url + 'matomo.php']);
      _paq.push(['setSiteId', environment.analytics.propertyId]);
      analytics.startTracking();
    }
  }

  ngOnInit() {}
}
