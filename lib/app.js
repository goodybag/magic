var
// Built-in
  os = require('os')
, http = require('http')
, net = require('net')
;

// instantiate HTTP server
var app = module.exports = require(__dirname + '/server').createAppServer();

var mount = function(collection) {
  app.use(require(__dirname + '/../collections/' + collection + '/server'));
};

// import resources
var collections = ['debug',
'admin',
'auth',
'activity',
'charities',
'businesses',
'locations',
'products',
'productCategories',
'users',
'consumers',
'managers',
'cashiers',
'tapin-stations',
'groups',
'loyaltyStats',
'photos',
'productTags',
'reviews',
'redemptions',
'events',
'actions']

collections.forEach(mount);
