var
  db  = require('../db')
, sql = require('./sql')

, Api = function(collection){
    this.collection = collection;
  }
;

Api.prototype.findOne = function(where, options, callback){
  var defaults = {
    fields: ['"' + this.collection + '".*']
  };

  if (typeof where !== "object") where = { id: where };

  if (typeof options === "function"){
    callback = options;
    options = defaults;
  }

  for (var key in defaults){
    if (!(key in options)) options[key] = defaults[key];
  }

  var this_ = this;

  db.getClient(function(error, client){
    if (error) return callback(error);

    var values = [];
    var query = sql.query('select {fields} from "{collection}" {where}');

    query.collection = this_.collection;

    query.fields = options.fields.join(', ');

    query.where = "";
    for (var key in where){
      if (values.length > 0) query.where += " and ";
      query.where += '"' + key + '" = $' + values.push(where[key]);
    }

    if (query.where.length > 0) query.where = "where " + query.where;

    client.query(query.toString(), values, function(error, result){
      if (error) return callback(error);

      callback(null, result.rows.length > 0 ? result.rows[0] : null, result);
    });
  });
};

Api.prototype.find = function(where, options, callback){
  var defaults = {
    fields: ['"' + this.collection + '".*']
  , count: true
  };

  if (typeof where !== "object") where = { id: where };

  if (typeof options === "function"){
    callback = options;
    options = defaults;
  }

  for (var key in defaults){
    if (!(key in options)) options[key] = defaults[key];
  }

  var this_ = this;

  db.getClient(function(error, client){
    if (error) return callback(error);

    var values = [];
    var query = sql.query('select {fields} from "{collection}" {where} {order}');

    query.collection = this_.collection;

    if (options.count) options.fields.push('COUNT(*) OVER() as "metaTotal"');

    query.fields = options.fields.join(', ');

    query.where = "";
    for (var key in where){
      if (values.length > 0) query.where += " and ";
      query.where += '"' + key + '" = $' + values.push(where[key]);
    }

    if (query.where.length > 0) query.where = "where " + query.where;

    if (options.order) query.order = options.order;

    client.query(query.toString(), values, function(error, result){
      if (error) return callback(error);

      var meta = {};
      if (options.count){
        meta.total = (result.rows[0]) ? result.rows[0].metaTotal : 0;
      }

      callback(null, result.rows, meta);
    });
  });
};

Api.prototype.insert = function(inputs, options, callback){
  var defaults = {
    returning: [this.collection + '.id']
  };

  if (typeof options === "function"){
    callback = options;
    options = defaults;
  } else {
    for (var key in defaults){
      if (!(key in options)) options[key] = defaults[key];
    }
  }

  var this_ = this;
  db.getClient(function(error, client){
    if (error) return callback(error);

    var query = sql.query('insert into "{collection}" ({fields}) values ({values}) {returning}');

    query.collection = this_.collection;
    query.fields = sql.fields().addObjectKeys(inputs);
    query.values = sql.fields().addObjectValues(inputs, query);

    if (options.returning){
      // Escape returning fields
      for (var i = options.returning.length - 1, period, ret; i >= 0; i--){
        ret = '"' + options.returning[i];

        if ((period = ret.indexOf(".")) > -1){
          ret = ret.substring(0, period) + '"."' + ret.substring(period + 1);
        }

        options.returning[i] = ret + '"';
      };
    }

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return callback(error);

      callback(null, result.rowCount > 0, result);
    });
  });
};

Api.prototype.update = function($query, $update, options, callback){
  var defaults = {};

  if (typeof options === "function"){
    callback = options;
    options = defaults;
  } else {
    for (var key in defaults){
      if (!(key in options)) options[key] = defaults[key];
    }
  }

  if (typeof $query !== "object") $query = { id: $query };

  var this_ = this;
  db.getClient(function(error, client){
    if (error) return callback(error);

    var query = sql.query('update "{collection}" set {updates} {where} {returning}');
    query.collection = this_.collection;
    query.updates = sql.fields().addUpdateMap($update, query);
    query.where = sql.where();

    for (var key in $query){
      query.where.and('"' + key + '" = ' + '$' + key);
      query.$(key, $query[key]);
    }

    if (options.returning){
      // Escape returning fields
      for (var i = options.returning.length - 1, period, ret; i >= 0; i--){
        ret = '"' + options.returning[i];

        if ((period = ret.indexOf(".")) > -1){
          ret = ret.substring(0, period) + '"."' + ret.substring(period + 1);
        }

        options.returning[i] = ret + '"';
      };
    }

    client.query(query.toString(), query.$values, function(error, result){
      if (error) return callback(error);

      callback(null, result.rowCount > 0, result);
    });
  });
};

module.exports = Api;