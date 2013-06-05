var assert = require('better-assert');
var tu = require('../../lib/test-utils');

/**
 * TODO:
 * Add permissioning and owner tests
 * Add some fail tests
 */

describe('GET /v1/locations/:lid/menu-sections', function() {
  it('should get menu sections', function(done){
    var lid = 51;
    tu.get('/v1/locations/' + lid + '/menu-sections', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.data.length > 0);

      // each section should have a name
      assert( payload.data.filter(function(section){
        return section.name.length > 0;
      }).length == payload.data.length );

      // Should be in order
      for (var i = 0, l = payload.data.length - 1; i < l; ++i){
        assert( payload.data[i].order <= payload.data[i + 1].order );
      }

      done();
    });
  });

  it('should get menu sections and include products', function(done){
    var lid = 51;
    var orderBySection = {
      "1":  [46175, 46183]
    , "2":  [46172, 46173]
    , "3":  [46174, 46177]
    , "4":  [46178, 46179]
    , "5":  [46180, 46184]
    , "6":  [46185, 46186]
    };

    tu.get('/v1/locations/' + lid + '/menu-sections?include[]=products', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      // Each section should have a products array
      payload.data.forEach(function(section){
        assert( Array.isArray( section.products ))

        // Products should be in order
        // I'm sorry if this becomes fragile in the future
        for (var i = 0, l = section.products.length; i < l; ++i){
          assert(section.products[i].id == orderBySection[section.id][i])
        }
      });

      done();
    });
  });
});

describe('POST /v1/locations/:lid/menu-sections', function() {
  it('should create a menu section', function(done){
    var lid = 1;
    var section = {
      name: 'My Menu Section'
    , order: 1
    , businessId: 1
    };

    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/menu-sections', section, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        tu.logout(done);
      });
    });
  });

  it('should create a menu section and also add products', function(done){
    var lid = 1;
    var section = {
      name: 'My Menu Section 2'
    , order: 2
    , businessId: 1
    , products: [
        { id: 1, locationId: lid, order: 1 }
      , { id: 4, locationId: lid, order: 3 }
      , { id: 5, locationId: lid, order: 2 }
      ]
    };

    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/menu-sections', section, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        payload = JSON.parse(payload);

        tu.get('/v1/locations/' + lid + '/menu-sections/' + payload.data.id, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);

          payload = JSON.parse(payload);

          payload.data.name == section.name;

          tu.logout(done);
        });
      });
    });
  });
});

describe('GET /v1/locations/:lid/menu-sections/:sectionId', function() {
  it('should get a menu section', function(done){
    var lid = 51, msid = 1;
    tu.get('/v1/locations/' + lid + '/menu-sections/' + msid, function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);
      payload = JSON.parse(payload);
      assert(payload.data.id == msid);
      done();
    });
  });
});

describe('PUT /v1/locations/:lid/menu-sections/:sectionId', function() {
  it('should update a menu section', function(done){
    var lid = 51, msid = 1;
    var section = {
      name: 'blah blah'
    , order: 17
    };
    tu.loginAsAdmin(function(){
      tu.put('/v1/locations/' + lid + '/menu-sections/' + msid, section, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 204);
        tu.get('/v1/locations/' + lid + '/menu-sections/' + msid, function(error, payload, response){
          assert(!error);
          assert(response.statusCode == 200);
          payload = JSON.parse(payload);
          assert(payload.data.id == msid);
          assert(payload.data.name == section.name);
          assert(payload.data.order == section.order);
          tu.logout(done);
        });
      });
    })
  });
});

describe('DELETE /v1/locations/:lid/menu-sections/:sectionId', function() {
  it('should update a menu section', function(done){
    var lid = 51, msid = 2;
    tu.loginAsAdmin(function(){
      tu.del('/v1/locations/' + lid + '/menu-sections/' + msid, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 204);
        tu.get('/v1/locations/' + lid + '/menu-sections/' + msid, function(error, payload, response){
          assert(response.statusCode == 404);
          tu.logout(done);
        });
      });
    })
  });
});

describe('POST /v1/locations/:lid/menu-sections/:sectionId', function() {
  it('should get a menu section', function(done){
    var lid = 51, msid = 1;
    // Add a product that previously wasnt in the list
    var item = { productId: 46187, order: 7 }
    tu.loginAsAdmin(function(){
      tu.post('/v1/locations/' + lid + '/menu-sections/' + msid, item, function(error, payload, response){
        assert(!error);
        assert(response.statusCode == 200);

        tu.get('/v1/locations/' + lid + '/menu-sections/' + msid + '?include=products', function(error, payload, response){
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
    //   tu.post('/v1/locations/' + lid + '/menu-sections/' + msid, item, function(error, payload, response){
    //     assert(!error);
    //     assert(response.statusCode == 200);
    //   });
    // });
  // });
});