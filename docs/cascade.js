var yaml = require('js-yaml');
var path = require('path');
var jsonselect = require('jsonselect');

// loadDocument
// ============
function loadDocument(filepath, options) {
  var doc = new CascadeDocument(filepath, options);
  if (!doc.rootNode)
    return null;
  return doc;
}
module.exports.loadDocument = loadDocument;

// CascadeDocument
// ===============
// the API for loading a document and applying "styles"
function CascadeDocument(filepath, options) {
  this.options = {};
  this.options.basepath = options.basepath || __dirname;
  this.options.styles   = options.styles || [];

  this.filepath = path.join(this.options.basepath, filepath);
  this.dirpath  = path.dirname(this.filepath);
  this.rawYaml  = require('fs').readFileSync(this.filepath, 'utf8');
  this.rootNode = yaml.load(this.rawYaml, { schema:CASCADE_SCHEMA });

  for (var i = 0; i < this.options.styles.length; i++) {
    var styleDoc = loadDocument(this.options.styles[i], { basepath:this.options.basepath });
    this.rootNode.unshift(styleDoc.rootNode);
  }

  this.applyTransforms(this.rootNode);
}
CascadeDocument.prototype.applyTransforms = function(node) {
  if (!node) return node;//node = this.rootNode;

  // arrays just iterate children (we only transform objects)
  if (Array.isArray(node)) {
    for (var i = 0, ii=node.length; i < ii; i++)
      node[i] = this.applyTransforms(node[i]);
    return node;
  }

  if (node && typeof node == 'object') {
    // import doc
    if (node instanceof ImportDocOp) {
      var newDoc = loadDocument(node.path, this.options);
      if (newDoc) {
        newDoc.applyTransforms(); // first run its own transformations
        this.applyTransforms(newDoc.rootNode); // now let it transform the doc its embedding into
        return newDoc.rootNode;
      }
    }
    // apply style
    else if (node instanceof StyleOp) {
      for (var selector in node.obj) {
        var mixin = node.obj[selector];
        var matches = jsonselect.forEach(selector, this.rootNode, function(obj) {
          for (var k in mixin)
            obj[k] = mixin[k];
        });
      }
    }

    // iterate child objects
    for (var k in node)
      node[k] = this.applyTransforms(node[k]);
  }

  return node;
};


function ImportDocOp(path) { this.path = path; }
function StyleOp(obj) { this.obj = obj; }
var CASCADE_SCHEMA = yaml.Schema.create([
  new yaml.Type('!import', {
    loader: {
      kind: 'string',
      resolver: function(str) {
        return new ImportDocOp(str);
      }
    }
  }),
  new yaml.Type('!styles', {
    loader: {
      kind: 'object',
      resolver: function(obj) {
        return new StyleOp(obj);
      }
    }
  })
]);