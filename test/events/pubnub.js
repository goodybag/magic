var assert = require('better-assert');
var sinon = require('sinon');
var pubnub  = require('../../lib/pubnub');

var tu = require('../../lib/test-utils');
var utils = require('../../lib/utils');

describe('Product Likes: ', function() {

  it('should receive an event through pubnub when a user likes a product', function(done) {

    pubnub.subscribe({
        channel:'products.like',
        connect:function() {
          tu.login({ email:'tapin_station_0@goodybag.com', password:'password' }, function(error, user) {
            tu.tapinAuthRequest('POST', '/v1/products/5/feelings', '778899-CBC', { isLiked:true }, function(error, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.userId == '11130');
          assert(message.productId == '5');
          done();
        }
    });
  });
});

describe('Product Creates: ', function() {

  it('should receive an event through pubnub when a product is created', function(done) {

    pubnub.subscribe({
        channel:'business-1.productCreate',
        connect:function() {
          tu.loginAsAdmin(function(error, user) {
            tu.post('/v1/products', { businessId:1, name:'Pubnub Test Product' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.product.name == 'Pubnub Test Product');
          done();
        }
    });
  });
});

describe('Product Updates: ', function() {

  it('should receive an event through pubnub when a product is updated', function(done) {

    pubnub.subscribe({
        channel:'business-1.productUpdate',
        connect:function() {
          tu.loginAsAdmin(function(error, user) {
            tu.put('/v1/products/5', { name:'Product 3.5555555' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.productId == '5');
          assert(message.updates.name == 'Product 3.5555555');
          done();
        }
    });
  });
});

describe('Business Loyalty Settings Updates: ', function() {

  it('should receive an event through pubnub when a business loyalty setting is updated', function(done) {

    pubnub.subscribe({
        channel:'business-1.loyaltySettingsUpdate',
        connect:function() {
          tu.loginAsAdmin(function(error, user) {
            tu.put('/v1/businesses/1/loyalty', { requiredItem:'The Triforce' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.updates.requiredItem == 'The Triforce');
          done();
        }
    });
  });
});

describe('Business Updates: ', function() {

  it('should receive an event through pubnub when a business is updated', function(done) {

    pubnub.subscribe({
        channel:'business-1.update',
        connect:function() {
          tu.loginAsAdmin(function(error, user) {
            tu.put('/v1/businesses/1', { name:'Business 3D!' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.updates.name == 'Business 3D!');
          done();
        }
    });
  });
});

describe('Business Logo Updates: ', function() {

  it('should receive an event through pubnub when a business logo is updated', function(done) {

    pubnub.subscribe({
        channel:'business-1.updateLogo',
        connect:function() {
          tu.loginAsAdmin(function(error, user) {
            tu.put('/v1/businesses/1', { logoUrl:'http://loljk.net/logo.png' }, function(err, results, res) {
              assert(res.statusCode == 200);
              tu.logout();
            });
          });
        },
        callback:function (message) {
          assert(message.updates.logoUrl == 'http://loljk.net/logo.png');
          done();
        }
    });
  });
});