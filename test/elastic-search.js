var assert  = require('better-assert');
var tu      = require('../lib/test-utils');
var config  = require('../config');
var Client  = require('../lib/elastic-client');
var elastic = require('../lib/elastic-search');

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

  describe ('Client.index', function(){

    it ('should save a document', function(done){
      var doc = {
        id: 1
      , name: 'Some Product'
      };

      elastic.save('product', doc, function(error, result){
        assert( !error );
        assert( result.ok == true );
        assert( result._id == doc.id );

        done();
      });
    });

  });

});