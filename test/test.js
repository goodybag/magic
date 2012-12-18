process.env.mode = 'test';

// unit tests
// ==========
require('./utils');


// functional tests
// ================

// create server
var app = require('../lib/server').createAppServer();
app.use(require('../collections/businesses/server'));
app.use(require('../collections/locations/server'));
app.use(require('../collections/products/server'));

var httpServer;

before(function(done) {
  var setupDb = require('../db/setup');
  setupDb(require('./db-config.js'), function() {
    httpServer = require('http').createServer(app).listen(8986);
    done();
  });
});

// collection resources
require('./collections/businesses');
require('./collections/locations');
require('./collections/products');

after(function() {
  httpServer.close();
});