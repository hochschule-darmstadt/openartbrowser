export const AnalyticsOptions = {
  pageTracking: {
    clearQueryParams: true,
    clearHash: true,
    clearIds: true, // is used to remove language identifier
    idsRegExp: new RegExp('en|de|fr|es|it')
  }
};
