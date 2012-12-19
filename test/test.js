process.env.mode = 'test';

// unit tests
// ==========
require('./utils');


// functional tests
// ================

// create server
var app = require('../lib/server').createAppServer();
app.use(require('../collections/auth/server'));
app.use(require('../collections/businesses/server'));
app.use(require('../collections/locations/server'));
app.use(require('../collections/products/server'));
app.use(require('../collections/productCategories/server'));
app.use(require('../collections/users/server'));
app.use(require('../collections/photos/server'));

var httpServer;

before(function(done) {
  var setupDb = require('../db/setup');
  setupDb(require('./db-config.js'), function() {
    httpServer = require('http').createServer(app).listen(8986);

    done();
  });
});

require('./collections/businesses');
require('./collections/locations');
require('./collections/users');
require('./collections/auth');
require('./collections/products');
require('./collections/productCategories');
require('./collections/photos');

after(function() {
  httpServer.close();
});