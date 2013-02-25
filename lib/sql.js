/*
  SQL generation made goody

  :NOTES:
   - to make a clause in the query non-optional, set its attribute to undefined
       eg 'SELECT * from locations {where}', query.where = undefined;
       if where is not set to a defined value, the query-construction will fail
*/


function Query(query) {
  this.query = (Array.isArray(query)) ? query.join(' ') : query;
  this.$values = [];
  this.$keys = [];
  this.__keyUid = 1;

  // provide empty defaults for all tokens
  var re = /\{([\w]*)\}/g, match;
  while (match = re.exec(this.query)) {
    this[match[1]] = '';
  }
}
// - if `key` is null, it will be assigned a name which is returned
Query.prototype.$ = function(key, value) {
  if (key === null) {
    key = 'param'+this.__keyUid++;
  }
  if (typeof key == 'object') {
    for (var k in key) {
      this.$(k, key[k]);
    }
  } else {
    if (this.$keys.indexOf(key) == -1) {
      this.$keys.push(key);
      this.$values.push(value);
    }
  }
  return '$'+key;
};
Query.prototype.toString = function() {
  var query = this.query;

  // replace {token}s with our attributes
  for (var k in this) {
    if (!this.hasOwnProperty(k) || k == '$s') { continue; }
    if (typeof this[k] == 'undefined') { throw "Undefined query part: "+k; }
    query = query.replace(RegExp('{'+k+'}','g'), ''+this[k]); // will run the attr's toString()
  }

  // replace $keys with $indexes
  var k;
  for (var i=0, ii=this.$keys.length; i < ii; i++) {
    k = this.$keys[i];
    query = query.replace(RegExp('\\$'+k,'g'), '$'+(i+1));
  }

  return query;
};

// Fields
// ======
// A general-purpose field list
function Fields() {
  this.fields = [];
}
Fields.prototype.add = function(field) {
  this.fields.push(field);
  return this;
};
// produces '"table"."field" AS "alias"' from [{alias:{table:{_name:'table'}, name:'field'}}]
Fields.prototype.addSelectMap = function(fields) {
  var field;
  for (var alias in fields) {
    field = fields[alias];
    if (typeof field !== 'object') { continue; }
    this.fields.push('"'+field.table._name+'"."'+field.name+'" AS "'+alias+'"');
  }
  return this;
};
// produces '"field" = $field' from { field:v, field:v, ...}
//   also adds the values to the `query` param for escaped insertion
Fields.prototype.addUpdateMap = function(fields, query) {
  for (var k in fields) {
    this.fields.push('"'+k+'" = $'+k);
    query.$(k, fields[k]);
  }
  return this;
};
// produces '"key1", "key2", "key3"...' from {key1:, key2:, key3: ...}
Fields.prototype.addObjectKeys = function(object) {
  for (var k in object) {
    this.fields.push('"'+k+'"');
  }
  return this;
};
// produces '$key1, $key2, $key3' from {key1:, key2:, key3: ...}
//   and adds the values to the `query` param for escaped insertion
Fields.prototype.addObjectValues = function(object, query) {
  for (var k in object) {
    this.fields.push('$'+k);
    query.$(k, object[k]);
  }
  return this;
};
Fields.prototype.toString = function() {
  return this.fields.join(', ');
};


function Where(where) {
  this.wheres = [];
  if (where) { this.and(where); }
}
Where.prototype.and = function(where) {
  this.wheres.push(where);
  return this;
};
Where.prototype.toString = function() {
  if (this.wheres.length === 0) { return ''; }
  return 'WHERE '+this.wheres.join(' AND ');
};


function Sort(sort) {
  this.sort = sort;
}
Sort.prototype.toString = function() {
  if (!this.sort) { return ''; }

  var matches = /(\+|-)?(.*)/.exec(this.sort);
  var direction = (matches[1] || '+');
  var field = matches[2];

  return ['ORDER BY', field, (direction == '-') ? 'DESC' : 'ASC'].join(' ');
};


function Limit(limit, offset) {
  this.limit = limit;
  this.offset = offset;
}
Limit.prototype.toString = function() {
  var str = [];
  if (this.limit) { str.push('LIMIT '+this.limit); }
  if (this.offset) { str.push('OFFSET '+this.offset); }
  return str.join(' ');
};


// - queryParam may be an array or a string
//   - the string may contain multiple comma-separated values
//   - a value may start with a an exclamation point to signify negation
function filtersMap(query, clause, queryParam) {
  var ORs = [].concat(queryParam);
  var orsClause = ORs.map(function(ANDs) {
    var andsClause = ANDs.split(',').map(function(item) {
      // parse the value
      var matches = /^(\!?)(.*)$/i.exec(item.trim());
      var isNegated = !!matches[1];
      var value = matches[2];

      // add the value as a parameter to the query
      var paramName = query.$(null, value);

      // generate the clause
      return clause
        .replace(/\{=\}/g, (isNegated) ? '!=' : '=')
        .replace(/\$filter/g, paramName);
    }).join(' AND ');
    return '('+andsClause+')';
  }).join(' OR ');
  return '('+orsClause+')';
};

function hstoreValue(obj, query){
  var out = "'";
  for (var key in obj){
    out += '"' + key + '"=>"' + obj[key] + '", ';
  }
  out = out.substring(0, out.length - 2) + "'";
  return out;
};


module.exports = {
  query       : function(query) { return new Query(query); },
  fields      : function() { return new Fields(); },
  where       : function(where) { return new Where(where); },
  sort        : function(sort) { return new Sort(sort); },
  limit       : function(limit, offset) { return new Limit(limit, offset); },
  filtersMap  : filtersMap,
  hstoreValue : hstoreValue
};