var config  = require('../config');
var Elastic = require('./elastic-client');

var elastic = module.exports = new Elastic({
  host:   config.elasticsearch.host
, index:  config.elasticsearch.index
});