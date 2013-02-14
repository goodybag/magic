var jsel = require('jsonselect');

/**
this guy is experimental and unfinished
**/

// wrap in a resource graph document
function ResourceGraph(data) {
  // gather resources
  var resources = this.resources = {};
  jsel.forEach(':root > *', data, function(v) {
    resources[v.path] = v;
  });
}
ResourceGraph.prototype.follow = function(path, rel) {
  var r = this.resources[path];
  if (!r)
    throw "Invalid resource path: "+path;
  links = jsel.match('.children :has(:root > .rel:val("'+rel+'"))', r);
  return this.resources[links[0].href];
};

// var rezGraph = new ResourceGraph(require('./experiment'));
// console.log('Resources:', require('util').inspect(rezGraph.resources, true, 10));
// console.log(rezGraph.follow('/reviews', 'item'));

module.expots = ResourceGraph;