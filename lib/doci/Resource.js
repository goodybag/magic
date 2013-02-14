// Resource Document
// =================
// represents the entire resource -- the top of the structure
function Resource(data) {
  this.data = require('../utils').deepClone(data);
}
Resource.prototype.makePath = function() {
  if (this.__path) { return this.__path; }
  var path = this.data.resource.path;
  for (var k in this.data.resource.params) {
    path = path.replace(RegExp(':'+k,'ig'), this.data.resource.params[k].eg);
  }
  this.__path = path;
  return path;
};
Resource.prototype.makeTestDescription = function() { return 'Chaos: '+this.data.resource.path; };
Resource.prototype.iterateMethods = function(cb) {
  for (var methodName in this.data.methods) {
    if (/delete/i.test(methodName)) continue; // can't do DELETE without losing our test data
    var method = new (require('./RequestMethod'))(this, methodName);
    cb(method);
  }
};

module.exports = Resource;