// Request Document
// ================
// represents a single request to a resource
function Request(data) {
  this.data = require('../utils').deepClone(data);
}

// does this request have any attributes in its primary input object?
Request.prototype.hasNoInputs = function() { return (!this.data.query && !this.data.body); };

// sets an attribute in the primary input object
Request.prototype.setInput = function(key, value) {
  if (this.data.query) {
    if (this.data.query[key])
      this.data.query[key].eg = value;
    else
      this.data.query[key] = { eg:value };
  } else if (this.data.body) {
    if (this.data.body[key])
      this.data.body[key].eg = value;
    else
      this.data.body[key] = { eg:value };
  }
};

// removes an attribute from the primary input object
Request.prototype.clearInput = function(key) {
  var wasRequired = false;
  if (this.data.query) {
    wasRequired = this.data.query[key].required;
    delete this.data.query[key];
  } else if (this.data.body) {
    wasRequired = this.data.body[key].required;
    delete this.data.body[key];
  }
  return wasRequired;
};

// outputs options to use in a request function
Request.prototype.toOptions = function() {
  var options = require('../utils').deepClone(this.data);
  options.headers = options.headers || {};

  if (options.body) {
    delete options.body;
    options.headers['content-type'] = 'application/json';
  }

  if (options.query) {
    var queryParams = [];
    for (var k in options.query) {
      if (Array.isArray(options.query[k].eg)) {
        for (var i=0; i < options.query[k].eg.length; i++) {
          queryParams.push(k+'[]='+prepInputValue(options.query[k].eg[i]));
        }
      } else {
        queryParams.push(k+'='+prepInputValue(options.query[k].eg));
      }
    }
    options.path += '?'+queryParams.join('&').replace(/ /g, '+');
    delete options.query;
  }

  return options;
};

// outputs payload to be used in a request function
Request.prototype.toPayload = function() {
  if (this.data.body) {
    var payload = {};
    for (var k in this.data.body) {
      payload[k] = prepInputValue(this.data.body[k].eg);
    }
    return JSON.stringify(payload);
  }
  return null;
};

var counter = 1;
function prepInputValue(v) {
  if (typeof v == 'string') {
    v = v.replace(/XXX/g, counter++);
  }
  return v;
}

module.exports = Request;