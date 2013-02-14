// Request Method Document
// =======================
// represents a single method on a resource
function RequestMethod(resourceDoc, methodName) {
  this.resourceDoc = resourceDoc;
  this.methodName = methodName;
  this.data = require('../utils').deepClone(resourceDoc.data.methods[methodName]);

  this.attrs = (methodName == 'get') ? this.data.query : this.data.body;
  this.attrKeys = (this.attrs) ? Object.keys(this.attrs) : [];
  this.numAttr = this.attrKeys.length;
}
RequestMethod.prototype.getDesc = function() { return this.data.desc; };
RequestMethod.prototype.getAttrType = function(key) { return this.attrs[key].type; };
RequestMethod.prototype.hasNoAttrs = function() { return !this.attrs; };
RequestMethod.prototype.needsAuth = function() { return (this.data.auth && this.data.auth.required) };
RequestMethod.prototype.getAuthCreds = function() { return this.data.auth.eg; };
RequestMethod.prototype.iterateAttributes = function(cb) { this.attrKeys.forEach(cb); };
RequestMethod.prototype.makeRequestDoc = function() {
  var reqDesc = {
    method: this.methodName.toUpperCase(),
    path: '/v1'+this.resourceDoc.makePath()
  };
  if (this.methodName == 'get')
    reqDesc.query = this.data.query;
  else
    reqDesc.body = this.data.body;
  return new (require('./Request'))(reqDesc);
};

module.exports = RequestMethod;