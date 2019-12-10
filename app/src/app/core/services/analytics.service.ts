import {AnalyticsProperty} from '../../../environments/environment_analytics';
declare const ga: (command: string, fields: string, options: string | boolean) => void;

export const AnalyticsService = {
  options: {
    pageTracking: {
      clearQueryParams: true,
    }
  },
  setTrackingId: () => {
    if (typeof ga === 'function') {
      ga('create', AnalyticsProperty.trackingId, 'auto');
      ga('set', 'anonymizeIp', true);
    }
  }
};

