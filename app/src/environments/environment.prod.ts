export const environment = {
  production: true
};

export const elasticEnvironment = {
  serverURI: '/api'
};

export const analyticsEnvironment = window.location.href === 'cai-artbrowserstaging.fbi.h-da.de' ?
  { // staging
    enabled: true,
    url: 'https://openartbrowser.org/api/analytics/',
    propertyId: '3'
  } :
  { // production
    enabled: true,
    url: '/analytics/',
    propertyId: '1'
  };

