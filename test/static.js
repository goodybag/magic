var assert = require('assert');

var omf = require('omf');

var app = require(__dirname + '/../lib/app');
omf(app, function(app) {
  app.get('/crossdomain.xml', function(res) {
    res.is.ok();
    res.has.header('content-type', 'application/xml');
    it('has correct body', function() {
      var wanted = '<allow-access-from domain="*" />'
      assert(this.response.body.indexOf(wanted) > -1, "body missing required text " + wanted);
    });
  });

  app.get('/proxy.html', function(res) {
    res.is.ok();
    res.is.html();
  });

  app.get('/name.html', function(res) {
    res.is.ok();
    res.is.html();
  });

  app.get('/easyxdm.swf', function(res) {
    res.is.ok();
    res.has.header('content-type', 'application/x-shockwave-flash');
  });
});
