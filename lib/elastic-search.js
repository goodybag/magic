var child   = require('child_process');
var config  = require('../config');
var Elastic = require('./elastic-client');

var elastic = module.exports = new Elastic({
  host:   config.elasticsearch.host
, index:  config.elasticsearch.index
, port:   config.elasticsearch.port
});