process.env['GB_ENV'] = 'test';
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

// functional tests
// ================
// enable profiler
var Profiler = require('clouseau');
Profiler.enabled = true;
Profiler.catchAll = true;

try {
  var testProfileDump = require('fs').readFileSync('./test-profile-dump.json', 'utf8');
  testProfileDump = JSON.parse(testProfileDump);
  // Profiler.tree = testProfileDump.tree;
  Profiler.totals = testProfileDump.totals;
} catch (e) {
  console.log('failed to load profile dump:', e);
}
Profiler.init({ displayInterval:0, useMicrotime:true });

// create server
var app = require('../lib/app');

before(function(done) {
  var self = this;
  var setupDb = require('../db/setup');
  this.timeout(10000);
  setupDb(require('./db-config.js'), function() {
    self.httpServer = require('http').createServer(app);
    self.httpServer.listen(8986, function(err){
      if (err) throw err;
      tu.loginAsAdmin(function() {
        tu.post('/v1/admin/algorithms/popular', {}, function() {
          tu.post('/v1/admin/algorithms/nearby', {}, function() {
            tu.logout(done);
          });
        });
      });
    });
    self.httpServer.on('connection', function(socket) {
      socket.on('error', function(e) { console.log("SOCKET ERROR", e); });
    });
  });
});

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
  'redemptions.collection'
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


describe('GET /v1/debug/profile', function() {
  it('should give us profiling stats on the previous tests', function(done) {
    tu.httpRequest({ path:'/v1/debug/profile?sort=-avg', method:'GET', headers:{ accept:'text/html' }}, null, function(err, payload, res) {
      assert(res.statusCode == 200);
      require('fs').writeFileSync('./test-profile.html', payload);
      require('fs').writeFileSync('./test-profile-dump.json', JSON.stringify({ totals:Profiler.totals }));
      done();
    });
  });
});

after(function() {
  this.httpServer.close();
});
