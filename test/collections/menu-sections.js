var assert = require('better-assert');
var tu = require('../../lib/test-utils');

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

// describe('POST /v1/locations/:lid/menu-sections', function() {
//   it('should create a menu section', function(done){
//     var lid = 1;
//     var section = {
//       name: 'My Menu Section'
//     , order: 1
//     , businessId: 1
//     };

//     tu.post('/v1/locations/' + lid + '/menu-sections', function(error, payload, response){
//       assert(!error);
//       assert(response.statusCode == 200);

//     });
//   });
// });