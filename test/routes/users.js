var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');


describe('POST /v1/users', function(){
    it('should save a user', function(done){
        var user = {
            name: "Ballers"
        };

        tu.post('/v1/businesses', business, function(error, results){
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            assert(results.data.id);
            done();
        });
    });

    it('should fail to save a business because of a validation error', function(done){
        var business = {
            name: "Ballers, Inc."
            , url: 123
            , cardCode: "123456"
            , street1: "123 Sesame St"
            , city: "Austin"
            , state: "TX"
            , zip: 78756
        };

        tu.post('/v1/businesses', business, function(error, results){
            assert(!error);
            results = JSON.parse(results);
            assert(results.error);
            done();
        });
    });

    it('should update a business\'s name and url', function(done){
        var business = {
            name: "Poophead McGees"
            , url: "http://pmcgee.com"
        };

        tu.post('/v1/businesses/' + 1, business, function(error, results){
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            done();
        });
    });

    it('should fail to update a business because of an invalid field', function(done){
        var business = {
            name: "Poophead McGees"
            , url: 123
        };

        tu.post('/v1/businesses/' + 1, business, function(error, results){
            assert(!error);
            results = JSON.parse(results);
            assert(results.error);
            done();
        });
    });
});