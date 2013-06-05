var assert = require('better-assert');
var tu = require('../../lib/test-utils');

describe('GET /v1/locations/:lid/menu-sections', function() {
  it('should get menu sections', function(done){
    var lid = 1;
    tu.get('/v1/locations/' + lid + '/menu-sections', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      assert(payload.data.length > 0);

      // each section should have a name
      assert( payload.data.filter(function(section){
        return section.name.length > 0;
      }).length == payload.length );

      // Should be in order
      for (var i = 0, l = section.length - 1; i < l; ++i){
        assert( section[i].order <= section[i + 1].order );
      }

      done();
    });
  });

  it('should get menu sections and include products', function(done){
    var lid = 1;
    tu.get('/v1/locations/' + lid + '/menu-sections?include[]=products', function(error, payload, response){
      assert(!error);
      assert(response.statusCode == 200);

      payload = JSON.parse(payload);

      // Each section should have a products array
      payload.data.forEach(function(section){
        assert( Array.isArray( section.products ))

        // Products should be in order
        for (var i = 0, l = section.products.length - 1; i < l; ++i){
          assert( section.products[i].order <= section.products[i + 1].order );
        }
      });

      done();
    });
  });
});