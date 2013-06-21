var security = require('../security');

var users = [
  ['admin@goodybag.com', 204],
  ['sales@goodybag.com', 204],
  ['some_manager@gmail.com', 204],
  [undefined, 403]
];

var tests = [];

users.forEach(function(def) {
  var user = def[0];
  var statusCode = def[1] || 204;
  tests.push({
    method: 'GET',
    path: '/v1/businesses/1/product-tags',
    user: user
  });

  var body = {
    tag: 'name'
  };

  tests.push({
    method: 'POST',
    path: '/v1/businesses/1/product-tags',
    user: user,
    body: body,
    statusCode: statusCode
  });

  tests.push({
    method: 'PUT',
    path: '/v1/businesses/1/product-tags/1',
    user: user,
    body: body,
    statusCode: statusCode
  })
});

security(tests);
