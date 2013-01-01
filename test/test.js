process.env['GB_ENV'] = 'test';

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
app.use(require('../collections/productTags/server'));

before(function(done) {
  var self = this;
  var setupDb = require('../db/setup');
  setupDb(require('./db-config.js'), function() {
    self.httpServer = require('http').createServer(app).listen(8986, function(err){
      if (err) throw err;
      done();
    });
  });
});

require('./collections/businesses');
require('./collections/locations');
require('./collections/users');
require('./collections/auth');
require('./collections/products');
require('./collections/productCategories');
require('./collections/photos');
require('./collections/productTags');

after(function() {
  this.httpServer.close();
});