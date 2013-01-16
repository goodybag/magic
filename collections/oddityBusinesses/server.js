/**
 * Oddity Businesses
 */

var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var schema     = require('../../db').schemas.oddity;
var schema     = require('../../db').schemas.oddityMeta;

// Oddity Businesses.list
server.get(
  '/v1/oddityBusinesses'
  , routes.list
);

module.exports = server;