function makeQueryDefaults(values) {
  return function(req, res, next) {
    for (var k in values) {
      if (typeof req.query[k] == 'undefined')
        req.query[k] = values[k];
    }
    next();
  };
}

module.exports.query = makeQueryDefaults;