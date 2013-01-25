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

  // provide empty defaults for all tokens
  var re = /\{([\w]*)\}/g, match;
  while (match = re.exec(this.query)) {
    this[match[1]] = '';
  }
}
Query.prototype.$ = function(key, value) {
  if (typeof key == 'object') {
    for (var k in key) {
      this.$(k, key[k]);
    }
  } else {
    this.$keys.push(key);
    this.$values.push(value);
  }
  return this;
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


// :TODO: might need another class for INSERT and UPDATE
function Fields() {
  this.fields = [];
}
Fields.prototype.add = function(field) {
  this.fields.push(field);
  return this;
};
Fields.prototype.addMap = function(fields) {
  var field;
  for (var alias in fields) {
    field = fields[alias];
    if (typeof field !== 'object') { continue; }
    this.fields.push('"'+field.table._name+'"."'+field.name+'" AS "'+alias+'"');
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


module.exports = {
  query  : function(query) { return new Query(query); },
  fields : function() { return new Fields(); },
  where  : function(where) { return new Where(); },
  sort   : function(sort) { return new Sort(sort); },
  limit  : function(limit, offset) { return new Limit(limit, offset); }
};