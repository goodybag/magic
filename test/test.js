var tu = require('../lib/test-utils');
var assert = require('better-assert');
var yaml = require('js-yaml');

// unit tests
// ==========
require('./utils');

// static tests
// ==========
require(__dirname + '/static');

// data access tests
require(__dirname + '/data-access');

// logger tests
require(__dirname + '/logger');
//
// business analytics tests
require(__dirname + '/business-analytics');

// elastic search tests
require(__dirname + '/elastic-search');

// functional tests
// ================

// security tests - run first because
// some of the users get altered in the integration tests
// but the security tests do not alter any data

require('./permissions/businesses.js');
require('./permissions/locations.js');
require('./permissions/product-categories.js');
require('./permissions/products.js');
require('./permissions/product-tags.js');

require('./collections/email');
require('./collections/charities');
require('./collections/businesses');
require('./collections/locations');
require('./collections/users');
require('./collections/consumers');
require('./collections/managers');
require('./collections/tapinStations');
require('./collections/cashiers');
require('./collections/groups');
require('./collections/loyaltyStats');
require('./collections/auth');
require('./collections/products');
require('./collections/productCategories');
require('./collections/photos');
require('./collections/productTags');
require('./collections/reviews');
require('./collections/redemptions');
require('./collections/events');
require('./collections/activity');
require('./collections/req-log');
require('./collections/menu-sections');
require('./collections/highlights');

// require('./events/pubnub');

// chaos tests
// ===========
var chaos = require('./chaos');
var doChaos = chaos.makeTestsBatch(function(resource) {
  resource.iterateMethods(function(methodDoc) {
    chaos.testValidRequest(methodDoc);
    chaos.testExtradataRequest(methodDoc);
    methodDoc.iterateAttributes(function(key) {
      chaos.testPartialRequest(methodDoc, key);
      chaos.testInvalidRequest(methodDoc, key);
    });
  });
});

var chaosBlacklist = [
  'consumers.cardUpdatesCollection', // skip these -- they have prereqs that dont work well for chaos
  'consumers.cardUpdatesItem',
  'consumers.consumerPasswordItem',
  'redemptions.collection',
  'products.search'
];

var doci = require('../lib/doci');
function loadDescription(collection, cb) {
  var data = require('../collections/'+collection+'/description.yaml', 'utf8');
  for (var k in data) {
    if (chaosBlacklist.indexOf(collection+'.'+k) !== -1) continue;
    cb(new doci.Resource(data[k]));
  }
}
loadDescription('activity', doChaos);
loadDescription('businesses', doChaos);
loadDescription('cashiers', doChaos);
loadDescription('charities', doChaos);
loadDescription('consumers', doChaos);
loadDescription('events', doChaos);
loadDescription('groups', doChaos);
loadDescription('locations', doChaos);
loadDescription('loyaltyStats', doChaos);
loadDescription('managers', doChaos);
loadDescription('photos', doChaos);
loadDescription('productCategories', doChaos);
loadDescription('products', doChaos);
loadDescription('productTags', doChaos);
loadDescription('redemptions', doChaos);
loadDescription('reviews', doChaos);
loadDescription('tapin-stations', doChaos);
loadDescription('users', doChaos);
loadDescription('email', doChaos);
