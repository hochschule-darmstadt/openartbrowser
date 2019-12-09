/// <reference types="@types/google.analytics" />
import {AnalyticsProperty} from '../../../environments/environment_analytics';

export const Analytics = {
  options: {
    pageTracking: {
      clearQueryParams: true,
    }
  },
  setTrackingId: () => {
    ga('create', AnalyticsProperty.trackingId, 'none');
  }
};

