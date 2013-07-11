var child   = require('child_process');
var config  = require('../config');
var Elastic = require('./elastic-client');

var elastic = module.exports = new Elastic({
  host:   config.elasticsearch.host
, index:  config.elasticsearch.index
, port:   config.elasticsearch.port
});

module.exports.startServer = function(){
  if (config.ENV != 'dev') return;

  var elasticProcess = child.spawn(
    config.elasticsearch.startCommand[0]
  , config.elasticsearch.startCommand.slice(1)
  );

  elasticProcess.stdout.on('data', function(data){
    console.log("ElasticSearch:");
    console.log("  ", data.toString());
  });

  elasticProcess.stderr.on('data', function(data){
    console.log("ElasticSearch ERROR:");
    console.log("  ", data.toString());
  });

  elasticProcess.on('close', function(code){
    console.log("ElasticSearch exited with code:", code);
  });
};