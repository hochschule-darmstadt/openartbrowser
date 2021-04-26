export const environment = {
  production: false,
  elastic: {
    base: 'http://localhost:9200',
    nonScrollingMaxQuerySize: 10000
  },
  imagesBase: '/api/images',
  analytics: {
    // docker
    enabled: false,
    url: '',
    propertyId: '0'
  }
};
