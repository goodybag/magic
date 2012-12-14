var assert = require('better-assert');
var sinon = require('sinon');

var tu = require('./test-utils');


describe('POST /v1/users', function () {
    it('user cannot be blank', function (done) {
        var user = {
            name:"Ballers"
        };

        tu.post('/v1/users', user, function (error, results) {
            assert(!error);
            results = JSON.parse(results);
            assert(!results.error);
            assert(results.data.id);
            done();
        });
    });


});