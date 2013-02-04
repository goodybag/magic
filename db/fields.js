var
  fs = require('fs')
, utils = require('../lib/utils')
, collections = {}
, files = fs.readdirSync(__dirname + '/schemas/')

, getExclusionFunction = function(type, table, fields){
    return function(){
      var exclusions = Array.prototype.slice.call(arguments, 0);

      if (type === "quoted") exclusions = exclusions.map(function(e){
        return '"' + e + '"';
      });

      if (type === "withTable") exclusions = exclusions.map(function(e){
        return '"' + table + '"' + '.' + '"' + e + '"';
      });

      return fields.filter(function(f){
        return !(exclusions.indexOf(f) > -1);
      });
    }
  }
;

// Get all of the schema files
for (var i = files.length - 1; i >= 0; i--){
  if (files[i].substring(files[i].length - 3) !== '.js') continue;
  if (files[i] === "indices.js") continue;

  collections[files[i].substring(0, files[i].length - 3)] = require(
    __dirname
    + '/schemas/'
    + files[i].substring(0, files[i].length - 3)
  );
}

// Convert the schema fields to arrays
var fields;
for (var key in collections){
  fields = [];

  for (var column in collections[key]){
    fields.push(column);
  }

  module.exports[key] = {};

  module.exports[key].plain = fields;

  module.exports[key].quoted = fields.map(function(f){
    return '"' + f + '"';
  });

  module.exports[key].withTable = fields.map(function(f){
    return '"' + key + '"."' + f + '"';
  });

  module.exports[key].plain.exclude = getExclusionFunction('plain', key, module.exports[key].plain);
  module.exports[key].quoted.exclude = getExclusionFunction('quoted', key, module.exports[key].quoted);
  module.exports[key].withTable.exclude = getExclusionFunction('withTable', key, module.exports[key].withTable);
}