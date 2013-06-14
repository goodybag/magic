var assert = require('better-assert');
var tu = require('../../lib/test-utils');

/**
 * TODO:
 * Product permissioning
 *   - Technically you could add products to your highlights that do not belong to you
 */

describe('GET /v1/locations/:lid/highlights', function() {
  it('should get higlights', function(done){
    var lid = 51;
    tu.get('/v1/locations/' + lid + '/highlights', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.data.length > 0);

      // each highlight should have a name
      assert( payload.data.filter(function(highlight){
        return highlight.name.length > 0;
      }).length == payload.data.length );

      // Should be in order
      for (var i = 0, l = payload.data.length - 1; i < l; ++i){
        assert( payload.data[i].order <= payload.data[i + 1].order );
      }

      done();
    });
  });

  it('should get higlights and include products', function(done){
    var lid = 51;
    // I couldn't get the sql query to embed the order into the product record
    var orderByhighlight = {
      "1":  [46175, 46183]
    , "2":  [46172, 46173]
    , "3":  [46174, 46177]
    , "4":  [46178, 46179]
    , "5":  [46180, 46184]
    , "6":  [46185, 46186]
    };

    tu.get('/v1/locations/' + lid + '/highlights?include[]=products', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      // Each highlight should have a products array
      payload.data.forEach(function(highlight){
        assert( Array.isArray( highlight.products ))

        // Products should be in order
        // I'm sorry if this becomes fragile in the future
        for (var i = 0, l = highlight.products.length; i < l; ++i){
          assert(highlight.products[i].id == orderByhighlight[highlight.id][i])
        }
      });

      done();
    });
  });
});

describe('POST /v1/locations/:lid/highlights', function() {
  it('should create a highlight', function(done){
    var lid = 1;
    var highlight = {
      name: 'My highlight'
    , order: 1
    , businessId: 1
    };

    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/highlights', highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        payload = JSON.parse(payload);

        tu.get('/v1/locations/' + lid + '/highlights/' + payload.data.id, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          tu.logout(done);
        });
      });
    });
  });

  it('should create a highlight and also add products', function(done){
    var lid = 1;
    var highlight = {
      name: 'My highlight 2'
    , order: 2
    , businessId: 1
    , products: [
        { id: 1, locationId: lid, order: 1 }
      , { id: 4, locationId: lid, order: 3 }
      , { id: 5, locationId: lid, order: 2 }
      ]
    };

    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/highlights', highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        payload = JSON.parse(payload);

        tu.get('/v1/locations/' + lid + '/highlights/' + payload.data.id, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);

          payload = JSON.parse(payload);

          payload.data.name == highlight.name;

          tu.logout(done);
        });
      });
    });
  });

  it('should create a highlight as a manager', function(done){
    var creds = { email: 'amys_manager@goodybag.com', password: 'password' };
    var lid = 51;
    var highlight = {
      name: 'My highlight 3'
    , order: 1
    , businessId: 39
    };

    tu.login(creds, function(){
      tu.post('/v1/locations/' + lid + '/highlights', highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        payload = JSON.parse(payload);

        tu.get('/v1/locations/' + lid + '/highlights/' + payload.data.id, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          tu.logout(done);
        });
      });
    });
  });

  it('should create a highlight and also add products as a manager', function(done){
    var creds = { email: 'amys_manager@goodybag.com', password: 'password' };
    var lid = 51;
    var highlight = {
      name: 'My highlight 4'
    , order: 2
    , businessId: 39
    , products: [
        { id: 1, locationId: lid, order: 1 }
      , { id: 4, locationId: lid, order: 3 }
      , { id: 5, locationId: lid, order: 2 }
      ]
    };

    tu.login(creds, function(){
      tu.post('/v1/locations/' + lid + '/highlights', highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        payload = JSON.parse(payload);

        tu.get('/v1/locations/' + lid + '/highlights/' + payload.data.id, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);

          payload = JSON.parse(payload);

          payload.data.name == highlight.name;

          tu.logout(done);
        });
      });
    });
  });
});

describe('GET /v1/locations/:lid/highlights/:highlightId', function() {
  it('should get a highlight', function(done){
    var lid = 51, msid = 1;
    tu.get('/v1/locations/' + lid + '/highlights/' + msid, function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.id == msid);
      done();
    });
  });
});

describe('PUT /v1/locations/:lid/highlights/:highlightId', function() {
  it('should update a highlight', function(done){
    var lid = 51, msid = 1;
    var highlight = {
      name: 'blah blah'
    , order: 17
    };
    tu.loginAsAdmin(function(){
      tu.put('/v1/locations/' + lid + '/highlights/' + msid, highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 204);
        tu.get('/v1/locations/' + lid + '/highlights/' + msid, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.id == msid);
          assert(payload.data.name == highlight.name);
          assert(payload.data.order == highlight.order);
          tu.logout(done);
        });
      });
    })
  });

  it('should update a highlight as a manager', function(done){
    var creds = { email: 'amys_manager@goodybag.com', password: 'password' };
    var lid = 51, msid = 1;
    var highlight = {
      name: 'blah blah'
    , order: 17
    };
    tu.login(creds, function(){
      tu.put('/v1/locations/' + lid + '/highlights/' + msid, highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 204);
        tu.get('/v1/locations/' + lid + '/highlights/' + msid, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.id == msid);
          assert(payload.data.name == highlight.name);
          assert(payload.data.order == highlight.order);
          tu.logout(done);
        });
      });
    })
  });

  it('should not be allowed to update', function(done){
    var creds = { email: 'some_manager@gmail.com', password: 'password' };
    var lid = 51, msid = 1;
    var highlight = {
      name: 'blah blah'
    , order: 17
    };
    tu.login(creds, function(){
      tu.put('/v1/locations/' + lid + '/highlights/' + msid, highlight, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 403);
        payload = JSON.parse(payload);
        assert(payload.error.name == 'NOT_ALLOWED');
        tu.logout(done);
      });
    })
  });
});

describe('DELETE /v1/locations/:lid/highlights/:highlightId', function() {
  it('should update a highlight', function(done){
    var lid = 51, msid = 2;
    tu.loginAsAdmin(function(){
      tu.del('/v1/locations/' + lid + '/highlights/' + msid, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 204);
        tu.get('/v1/locations/' + lid + '/highlights/' + msid, function(error, payload, response){
          assert(response.statusCode == 404);
          tu.logout(done);
        });
      });
    })
  });
});

describe('POST /v1/locations/:lid/highlights/:highlightId', function() {
  it('should get a highlight', function(done){
    var lid = 51, msid = 1;
    // Add a product that previously wasnt in the list
    var item = { productId: 46187, order: 7 }
    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/highlights/' + msid, item, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        tu.get('/v1/locations/' + lid + '/highlights/' + msid + '?include=products', function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          payload = JSON.parse(payload);
          assert(
            payload.data.products.filter(function(product){
              return product.id == item.productId;
            }).length == 1
          );
          tu.logout(done);
        });
      });
    });
  });

  /**
   * TODOTODODOTODODOTODODODOTODO
   */
  // it('should bitch about the product not belonging to the business', function(done){
    // var lid = 51, msid = 1;
    // // Add a product that previously wasnt in the list
    // var item = { productId: 1, order: 7 }
    // tu.loginAsAdmin(function(){
    //   tu.post('/v1/locations/' + lid + '/highlights/' + msid, item, function(error, payload, response){
    //     assert(!error);
    //     assert(response.statusCode == 200);
    //   });
    // });
  // });
});