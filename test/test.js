process.env['GB_ENV'] = 'test';

// unit tests
// ==========
require('./utils');


// functional tests
// ================

// create server
var app = require('../lib/server').createAppServer();
app.use(require('../collections/auth/server'));
app.use(require('../collections/charities/server'));
app.use(require('../collections/businesses/server'));
app.use(require('../collections/locations/server'));
app.use(require('../collections/products/server'));
app.use(require('../collections/productCategories/server'));
app.use(require('../collections/users/server'));
app.use(require('../collections/consumers/server'));
app.use(require('../collections/managers/server'));
app.use(require('../collections/tapin-stations/server'));
app.use(require('../collections/cashiers/server'));
app.use(require('../collections/groups/server'));
app.use(require('../collections/loyaltyStats/server'));
app.use(require('../collections/photos/server'));
app.use(require('../collections/productTags/server'));
app.use(require('../collections/reviews/server'));
app.use(require('../collections/redemptions/server'));
app.use(require('../collections/events/server'));
app.use(require('../collections/activity/server'));

before(function(done) {
  var self = this;
  var setupDb = require('../db/setup');
  setupDb(require('./db-config.js'), function() {
    self.httpServer = require('http').createServer(app);
    self.httpServer.listen(8986, function(err){
      if (err) throw err;
      done();
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

after(function() {
  this.httpServer.close();
});