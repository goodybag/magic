var assert  = require('better-assert');
var tu      = require('../lib/test-utils');
var async   = require('async');
var config  = require('../config');
var Client  = require('../lib/elastic-client');
var elastic = require('../lib/elastic-search');

var dataPopulation = {
  'Batch #1 - Gerdyburger Dirdyberg': {
    product:        'Gerdyburger'
  , business:       'Dirdyberg'
  , numToGenerate:   20
  , generated:       []

  , fn: function(context, done){
      for (var i = 0; i < context.numToGenerate; i++) context.generated.push({
        name:         context.product + ' ' + (i + 1)
      , businessName: context.business
      });

      async.series(
        context.generated.map(function(item){
          return function(done){ elastic.save( 'product', item, done ); }
        }
      )
      , function(error){
          if (error) return done(error);

          // Give ES some time
          setTimeout(done, 1000);
        }
      );
    }
  }
};

before(function(done){

  // Kill everything
  elastic.removeSelf(function(error){

    // And bring back the index
    elastic.ensureIndex(function(error){
      if (error) throw error;

      // Populate all data from tests
      async.series(
        Object.keys( dataPopulation ).map( function(key){
          return function(done){ dataPopulation[key].fn( dataPopulation[key], done ) }
        })
      , done
      )
    });
  });
});

describe ('Elastic Searchin', function(){

  describe ('General Elastic Search Module Stuff', function(){

    it ('should instantiate a new client', function(){
      var options = {
        host:   'http://my-elastic-search.com'
      , index:  'staging'
      };

      var myClient = new Client(options);

      assert( myClient.host == options.host );
      assert( myClient.index == options.index );
    });

    it ('should instantiate a new client with mappings', function(done){
      var mappings;
      var options = {
        host:   config.elasticsearch.host
      , port:   config.elasticsearch.port
      , index:  config.elasticsearch.index + '-' + parseInt(Math.random()*99999).toString(36)

      , indexProperties: {
          mappings: mappings = {
            product: {
              properties: {
                name: {
                  type: 'string'
                , analyzer: 'whitespace'
                }
              }
            }
          }
        }
      };

      var myClient = new Client(options);

      myClient.ensureIndex(function(error){
        assert( !error );

        myClient.getMapping('product', function(error, result){
          assert( !error );

          for (var field in result.properties){
            for (var property in result.properties[field]){
              assert( mappings.product.properties[field][property] == result.properties[field][property] );
            }
          }

          myClient.removeSelf(done);
        });
      });
    });

    it ('should be able to use the elastic search module', function(){
      assert( elastic.host == config.elasticsearch.host );
      assert( elastic.index == config.elasticsearch.index );
    });

  });

  describe ('Client.info', function(){

    it ('should get the server info', function(done){
      elastic.info(function(error, info){
        assert( !error );
        assert( info.ok == true );
        assert( info.status == 200 );
        assert( info.name );

        done();
      });
    });

  });

  describe ('Client.save', function(){

    it ('should save a document', function(done){
      var doc = {
        id: 111111111111
      , name: 'Some Product'
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        done();
      });
    });

    it ('should save a document and generate an ID', function(done){
      var doc = {
        name: 'Some Other Product'
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id );

        done();
      });
    });

    it ('should save a document and then update it', function(done){
      var doc = {
        id: 222222222222
      , name: 'Another Product'
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        doc.poop = true;

        elastic.save('product', doc, function(error, result){
          assert( !error );
          assert( result.ok == true );
          assert( result._id == doc.id );

          elastic.get('product', doc.id, function(error, result){
            assert( !error );

            for (var key in result){
              assert( key in doc );
              assert( result[key] === doc[key] );
            }

            done();
          });
        });

      });
    });

  });

  describe ('Client.get', function(){

    it ('should get a record', function(done){
      var doc = {
        id: 222222222222
      , name: 'Another Product'
      , something: 'else'
      , blah: true
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        elastic.get('product', doc.id, function(error, result){
          assert( !error );

          for (var key in result){
            assert( key in doc );
            assert( result[key] === doc[key] );
          }

          done();
        });
      });
    });

    it ('should not find the record', function(done){
      var doc = {
        id: 222222322222
      };

      elastic.get('product', doc.id, function(error, result){
        assert( !error );
        assert( !result );

        done();
      });
    });

  });

  describe ('Client.search', function(){

    it ('should search product by name', function(done){

      var data = dataPopulation[ 'Batch #1 - Gerdyburger Dirdyberg' ];

      var $query = {
        query: {
          match: {
            name: data.product
          }
        }
      };

      elastic.search('product', $query, function(error, result){
        assert( !error );
        assert(result.hits.total >= data.generated.length)
        // At least some of the results are in the initial data set
        // since we may be matching other data populated iwth this being so fuzzy
        assert(
          result.hits.hits.some(function(hit){
            return data.generated.map(function(p){
              return p.name
            }).indexOf(hit._source.name) > -1;
          })
        );
        done();
      });

    });

    it ('should do a partial search by product name', function(done){

      var data = dataPopulation[ 'Batch #1 - Gerdyburger Dirdyberg' ];

      var $query = {
        query: {
          multi_match: {
            query: data.product.substring(0, 4)
          , fields: ['name.partial']
          }
        }
      };

      elastic.search('product', $query, function(error, result){
        assert( !error );
        assert(result.hits.total >= data.generated.length)
        // At least some of the results are in the initial data set
        // since we may be matching other data populated iwth this being so fuzzy
        assert(
          result.hits.hits.some(function(hit){
            return data.generated.map(function(p){
              return p.name
            }).indexOf(hit._source.name) > -1;
          })
        );
        done();
      });

    });

  });

  describe ('Client.del', function(){

    it ('should delete a record', function(done){
      var doc = {
        id: 222222422222
      , name: "To Be Deleted"
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        elastic.get('product', doc.id, function(error, result){
          assert( !error );
          assert( result );

          elastic.del('product', doc.id, function(error, result){
            assert( !error );
            assert( result.ok == true );

            elastic.get('product', doc.id, function(error, result){
              assert( !error );
              assert( !result );

              done();
            });
          });
        });
      });
    });

  });

});