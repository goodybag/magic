var security = require('../security');

var users = [
  ['admin@goodybag.com', 204],
  ['some_manager@gmail.com', 204],
  ['manager_redeem3@gmail.com', 403],
  ['consumer@goodybag.com', 403],
  [undefined, 401]
]

var tests = [];
users.forEach(function(def) {
  var user = def[0];
  var statusCode = def[1] || 204;

  //read all
  tests.push({
    method: 'GET',
    path: '/v1/products',
    user: user
  });

  //read one
  tests.push({
    method: 'GET',
    path: '/v1/products/1',
    user: user
  });

  var product = {
    businessId: 1,
    name: 'Delicious product'
  };

  //anyone logged in can create

  tests.push({
    method: 'POST',
    path: '/v1/products',
    user: user,
    body: product,
    statusCode: (typeof(user) === 'undefined' ? 403 : 204)
  });

  //update
  tests.push({
    method: 'PUT',
    path: '/v1/products/1',
    user: user,
    body: product,
    statusCode: statusCode
  });

  tests.push({
    method: 'PUT',
    path: '/v1/locations/1/products/1',
    user: user,
    body: { inSpotlight: true },
    statusCode: statusCode
  });

});

security(tests);
