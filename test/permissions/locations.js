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
  method: 'DELETE',
  path: '/v1/locations/2/products/1',
  user: 'some_manager@gmail.com'
}, {
  method: 'POST',
  path: '/v1/locations/2/products',
  body: {
    productId: 1
  },
  user: 'some_manager@gmail.com'
}];

require('../security')(scenarios);
