var validBusinessUpdateBody = {
  name: 'zug zug'
};

var scenarios = [{
  method: 'GET',
  path: '/v1/locations/1'
}, {
  method: 'POST',
  path: '/v1/locations',
  statusCode: 401
}, {
  method: 'PUT',
  path: '/v1/locations/1',
  user: 'some_manager@gmail.com'
}, {
  method: 'PUT',
  path: '/v1/locations/2',
  user: 'some_manager@gmail.com',
  statusCode: 403
}, {
  method: 'DELETE',
  path: '/v1/locations/1/products/1',
  user: 'some_manager@gmail.com'
}, {
  method: 'POST',
  path: '/v1/locations/1/products',
  body: {
    productId: 1
  },
  user: 'some_manager@gmail.com'
}, {
  method: 'POST',
  path: '/v1/locations/4/products',
  body: {
    productId: 1
  },
  user: 'some_manager@gmail.com'
}, {
  method: 'DELETE',
  path: '/v1/locations/4/products/1',
  user: 'some_manager@gmail.com'
}, {
  method: 'PUT',
  path: '/v1/locations/1/products/1',
  user: 'some_manager@gmail.com',
  body: {
    inSpotlight: true
  }
}, {
  method: 'PUT',
  path: '/v1/locations/4/products/1',
  user: 'some_manager@gmail.com',
  body: {
    inSpotlight: true
  }
}, {
  method: 'PUT',
  path: '/v1/locations/4/products/1',
  body: {
    inSpotlight: true
  },
  statusCode: 401
}, {
  method: 'DELETE',
  path: '/v1/locations/4/products/1',
  statusCode: 401
}];


require('../security')(scenarios);
