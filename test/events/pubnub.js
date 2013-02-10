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