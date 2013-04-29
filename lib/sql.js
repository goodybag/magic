/*
  SQL Query Construction Toolset
  ==============================

  Basic usage:

    var query = sql.query([
      'SELECT {fields} FROM mytable {otherTableJoin} {where}',
        '{sort} {limit}'
    ]);

    query.otherTableJoin = 'INNER JOIN othertable ON othertable.mytableid = mytable.id';

    query.fields = sql.fields();
    query.fields
      .addSelectMap('mytable', { id:'myid', name:'myName' })
      .addSelectMap('othertable', { id:'otherid', name:'otherName' });

    query.where = sql.where('id > 5').and('(created_at < NOW() OR created_at IS NULL)');
    query.sort = sql.sort('-id');
    query.limit = sql.limit(10, 5);

    query.toString();
    // => SELECT "mytable"."id" AS "myid", "mytable"."name" AS "myName", "othertable"."id" AS "otherId", "othertable"."name" AS "othername"
    //      FROM mytable
    //      INNER JOIN othertable ON othertable.mytableid = mytable.id
    //      WHERE id > 5 AND (created_at < NOW() OR created_at IS NULL)
    //      ORDER BY id DESC
    //      LIMIT 10 OFFSET 5


  Escaping values:

    var query = sql.query('UPDATE mytable SET name=$name, age=$age');

    query.$('name', 'Alice');
    query.$('age', 38);

    query.toString();
    // => UPDATE mytable SET name=$1, age=$2
    query.$values
    // => ['Alice', 38]


  Inserting an object:

    var query = sql.query('INSERT INTO mytable ({columns}) VALUES {values}');

    var myInput = {
      name: 'Bob',
      age: 54
    };
    query.columns = sql.fields().addObjectKeys(myInput);
    query.values = sql.fields().addObjectValues(myInput);

    query.toString();
    // => INSERT INTO mytable ("name", "age") VALUES $1, $2
    query.$values
    // ['Bob', 54]

*/

// Query Constructor
// =================
//
// Usage:
//   var query = new sql.Query('SELECT * FROM mytable WHERE id=$id');
//   query.$('id', 5);
//   pgClient.query(query.toString(), query.$values, cb);
//
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
    query = query.replace(RegExp('(\\$)' + k + '(\\W|$)','g'), '$1' + (i+1) + '$2');
  }

  return query;
};

Query.prototype.toQuery = function() {
  return {
    text: this.toString(),
    values: this.$values
  }
};

// Fields Constructor
// ==================
//
// Usage:
//   var fields = new sql.Fields();
//   fields.add('column1').add('column2');
//   fields.toString(); // => column1, column2
function Fields() {
  this.fields = [];
}

Fields.prototype.add = function(field) {
  this.fields.push(field);
  return this;
};

// produces "table"."fieldname" AS "alias"
//   where `table` is a string and `aliases` is an array of the form [{fieldname: alias}, ...]
Fields.prototype.addSelectMap = function(table, aliases) {
  for (var fieldname in aliases) {
    this.fields.push('"'+table+'"."'+fieldname+'" AS "'+aliases[fieldname]+'"');
  }
  return this;
};

// produces "field" = $field
// and adds $field = v to the query
//   where `fields` is an object of the form {field: v, field2: v2, ...}
//   and `query` is the sql.Query receiving the escaped values
Fields.prototype.addUpdateMap = function(fields, query) {
  for (var k in fields) {
    this.fields.push('"'+k+'" = $'+k);
    query.$(k, fields[k]);
  }
  return this;
};

// produces "key1", "key2", "key3"...
//   where `object` is an object of the form {key1:, key2:, key3: ...}
Fields.prototype.addObjectKeys = function(object) {
  for (var k in object) {
    this.fields.push('"'+k+'"');
  }
  return this;
};

// produces $key1, $key2, $key3
// and adds $key1=v1, $key2=v2... to the query
//   where `object` is an object of the form {key1: v1, key2: v2, key3: v3 ...}
//   and `query` is the sql.Query receiving the escaped values
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

// Where Constructor
// =================
//
// Usage:
//   var where = new sql.Where();
//   where.and('x = 5').and('y = 10').and('(z = 15 OR z = 20)');
//   where.toString(); // => x = 5 AND y = 10 AND (z = 15 OR z = 20)
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

// Sort Constructor
// ================
//
// Usage:
//   var sort = new sql.Sort('-id');
//   sort.toString(); // => ORDER BY id DESC
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

// Limit Constructor
// =================
//
// Usage:
//   var limit = new sql.Limit(10,5);
//   limit.toString(); // => LIMIT 10 OFFSET 5
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

// Filters Map Helper
// ==================
//
// Usage:
//   sql.filtersMap(query, 'mytags.tag {=} $filter', ['food','!clothes,!sports']);
//   // => ((mytags.tag = 'food') OR (mytags.tag != 'clothes' AND mytags.tag != 'sports'))
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
}

// HStore Value Helper
// ===================
//
// Usage:
//   sql.hstoreValue({ a: 5, b: 6, c: 7 });
//   // => '"a"=>"5", "b"=>"6", "c"=>"7"'
function hstoreValue(obj){
  var out = [];
  for (var key in obj){
    out.push('"' + key + '"=>"' + obj[key] + '"');
  }
  return "'" + out.join(', ') + "'";
}


module.exports = {
  query       : function(query) { return new Query(query); },
  fields      : function() { return new Fields(); },
  where       : function(where) { return new Where(where); },
  sort        : function(sort) { return new Sort(sort); },
  limit       : function(limit, offset) { return new Limit(limit, offset); },
  filtersMap  : filtersMap,
  hstoreValue : hstoreValue
};
