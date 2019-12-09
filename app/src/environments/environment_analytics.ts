import { environment } from './environment';

const prodProperty = {
  trackingId: 'UA-153519271-1'
};

const testProperty = {
  trackingId: 'UA-153519271-2'
};

export const AnalyticsProperty = environment.production ? prodProperty : testProperty;
