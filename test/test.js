process.env.mode = 'test';

// unit tests
// ==========
require('./utils');


// functional tests
// ================
var app = require('../lib/server').createAppServer();
var httpServer;

before(function(done) {
  var setupDb = require('../db/setup/index');
  setupDb(require('./db-config.js'), function() {
    httpServer = require('http').createServer(app).listen(8986);
    done();
  });
});

require('./routes/businesses');
require('./routes/locations');
require('./routes/users');


after(function() {
  httpServer.close();
});