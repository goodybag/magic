var yaml = require('js-yaml');
var path = require('path');

// loadDocument
// ============
function loadDocument(filepath) {
  var dirpath = path.dirname(filepath);
  var rawYaml = require('fs').readFileSync(path, 'utf8');
  return yaml.load(rawYaml, { schema:makeSchema({ basePath:dirpath }) });
}
module.exports.loadDocument = loadDocument;

// transform
// =========
function transform(doc, api) {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(function(element) { return transform(element, api); });
  }
  if (typeof doc == 'object') {
    var handler = api.getHandler(doc);
    if (handler) {
      console.error('Invalid handler type', doc.handler, doc);
      handler = noop;
    }
    handler(doc);
    for (var k in doc) {
      if (doc[k] && typeof doc[k] == 'object')
        transform(doc[k], api);
    }

  }
  return doc;
}
module.exports.transform = transform;

// API
// ===
// the base prototype for a user's transform library
function API() {
}
API.prototype.getHandler = function(node) {
  var handler = node.handler || 'noop';
};




// internal helpers
// ================

// we have to make the schema every time because js-yaml doesnt let us pass params to the types
function makeSchema(options) {
  return yaml.Schema.create([
    new yaml.Type('!import', {
      loader: {
        kind: 'string',
        resolver: function(str) {
          return loadDocument(path.join(options.basepath, str));
        }
      }
    }),
    new yaml.Type('!styles', {
      loader: {
        kind: 'object',
        resolver: function(obj) {
          obj.handler = 'styles';
          return obj;
        }
      }
    })
  ]);
}

function noop() {}