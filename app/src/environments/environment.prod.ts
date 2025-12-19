export const environment = {
  production: true,
  elastic: {
    base: '/api',
    nonScrollingMaxQuerySize: 10000,
  },
  imagesBase: '/api/images',
  analytics:
    window.location.host === 'cai-artbrowserstaging.fbi.h-da.de'
      ? {
          // staging
          enabled: true,
          url: 'https://openartbrowser.org/api/analytics/',
          propertyId: '3',
        }
      : {
          // production
          enabled: true,
          url: '/api/analytics/',
          propertyId: '1',
        },
};
