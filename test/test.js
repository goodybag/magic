// unit tests
// ==========
require('./utils');


// functional tests
// ================
var app = require('../lib/server').createAppServer();
var httpServer;

before(function() {
  // :TODO: need to set up test DB and make sure it's filled with fixtures

  httpServer = require('http').createServer(app).listen(8986);
});

require('./routes/businesses');

after(function() {
  httpServer.close();
});