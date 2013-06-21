var validBusinessUpdateBody = {
  name: 'zug zug'
};

var scenarios = {
  businesses: [{
    method: 'GET',
    path: '/v1/businesses/1',
    user: 'some_manager@gmail.com'
  }, {
    method: 'PUT',
    path: '/v1/businesses/1',
    user: 'some_manager@gmail.com',
    body: validBusinessUpdateBody
  }, {
    method: 'POST',
    path: '/v1/businesses',
    user: 'some_manager@gmail.com',
    body: validBusinessUpdateBody,
    statusCode: 403
  }, {
    method: 'PUT',
    path: '/v1/businesses/2',
    user: 'some_manager@gmail.com',
    body: validBusinessUpdateBody,
    statusCode: 403
  }, {
    method: 'GET',
    path: '/v1/businesses/1/measures',
    user: 'some_manager@gmail.com'
  }, {
    method: 'GET',
    path: '/v1/businesses/2/measures',
    user: 'some_manager@gmail.com',
    statusCode: 403
  }],
  locations: [{
    method: 'GET',
    path: '/v1/locations'
  }]
};

require('../security')(scenarios);
