/**
 * Events server
 */

var server      = require('express')();
var routes      = require('./routes');
var desc        = require('./description.yaml');

server.post('/v1/actions', routes.post);

module.exports = server;
