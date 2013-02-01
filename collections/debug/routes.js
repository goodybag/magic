/**
 * Debug
 */

var Profiler = require('clouseau');

module.exports.profile = function(req, res){
  res.status(200).end(Profiler.getFormattedData());
};
