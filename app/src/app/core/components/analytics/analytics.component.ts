import { Component, Directive } from '@angular/core';
import { Angulartics2Matomo } from 'angulartics2';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    _paq: any;
  }
}

@Component({
  selector: 'app-analytics',
  template: '',
})
export class AnalyticsComponent {
  constructor(public analytics: Angulartics2Matomo) {
    if (environment.analytics.enabled) {
      const _paq = window._paq || [];
      _paq.push(['disableCookies']);
      _paq.push(['setTrackerUrl', environment.analytics.url + 'matomo.php']);
      _paq.push(['setSiteId', environment.analytics.propertyId]);
      analytics.startTracking();
    }
  }
}
