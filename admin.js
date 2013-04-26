/**
 * what_a_load.js: wide-coverage HTTP request load testing
 */

require('js-yaml');
var tu = require('./lib/test-utils');
var doci = require('./lib/doci');

// cli args helpers
var getArg = function(option, fallback){
  var pos = process.argv.indexOf(option);
  if (pos === -1) return fallback;
  var v = process.argv[pos + 1];
  process.argv.splice(pos, 2); // remove from argv, so we don't misinterpret them later
  return v;
};
var getFlag = function(option, fallback){
  var pos = process.argv.indexOf(option);
  if (pos === -1) return fallback;
  process.argv.splice(pos, 1); // remove from argv, so we don't misinterpret it later
  return true;
};
function usage() {
  console.log('Usage:');
  console.log('  node admin.js [-v] <task>');
}

// task definitions
// ================
var adminRoutes = require('./collections/admin/routes');
var cliRequest = {
  uuid: 'cli',
  query:{}
};
var cliResponse = {
  error: function() { console.error.apply(console, arguments); },
  send: function() {
    console.log.apply(console, arguments);
    process.exit(0);
  }
};
var tasks = {
  genlists: function() {
    adminRoutes.rebuildPopularList(cliRequest, cliResponse);
  },
  gennearby: function() {
    adminRoutes.rebuildNearbyGrid(cliRequest, cliResponse);
  }
};

// execute
// =======
cliRequest.query.verbose = getFlag('-v') || getFlag('--verbose', false);

var task = process.argv[process.argv.length - 1];
if (Object.keys(tasks).indexOf(task) === -1) {
  console.log('error: Invalid task. Available tasks are: '+Object.keys(tasks).join(', '));
  usage();
  return;
}

tasks[task].call();