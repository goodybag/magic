var Profiler = require('clouseau');

var profile = function(name, params) {
  return function(req, res, next) {
    var n = name;

    if (params && Array.isArray(params)) {
      var p = [];
      params.forEach(function(k) {
        var v = req.param(k);
        if (typeof v != 'undefined')
          p.push(k+'='+v);
      });
      n = n + ' ' + p.join(', ');
    }

    Profiler.__f(next, n)();
  };
};

module.exports = profile;