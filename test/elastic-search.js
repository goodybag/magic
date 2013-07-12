var assert  = require('better-assert');
var tu      = require('../lib/test-utils');
var config  = require('../config');
var Client  = require('../lib/elastic-client');
var elastic = require('../lib/elastic-search');

before(function(done){

  // Kill everything
  elastic.removeSelf(function(error){
    if (error) throw error;

    // And bring back the index
    elastic.ensureIndex(function(error){
      if (error) throw error;

      done();
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

        elastic.save('product', { id: doc.id, poop: true }, function(error, result){
          assert( !error );
          assert( result.ok == true );
          assert( result._id == doc.id );

          elastic.get('product', doc.id, function(error, result){
            assert( !error );
            assert( result.exists == true );
            assert( result._id == doc.id );
            assert( result._source.poop == true );
            done();
          });
        });

      });
    });

  });

  describe ('Client.get', function(){

    it ('should get a record', function(){
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
          assert( result.exists == true );
          assert( result._id == doc.id );

          for (var key in result._source){
            assert( key in doc );
            assert( result._source[key] === doc[key] );
          }

          done();
        });
      });
    });

    it ('should not find the record', function(){
      var doc = {
        id: 222222322222
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        elastic.get('product', doc.id, function(error, result){
          assert( !error );
          assert( result.exists == false );

          done();
        });
      });
    });

  });

});