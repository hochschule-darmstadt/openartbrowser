import {AnalyticsProperty} from '../../../environments/environment_analytics';
declare const ga: (command: string, trackingId: string, cookieDomain: string) => void;

export const AnalyticsService = {
  options: {
    pageTracking: {
      clearQueryParams: true,
    }
  },
  setTrackingId: () => {
    if (typeof ga === 'function') {
      ga('create', AnalyticsProperty.trackingId, 'auto');
    }
  }
};

