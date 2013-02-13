
var validators = {
  'int': function(v) { 
    if (typeof v != 'number' && (typeof v == 'string' && /^[0-9]+$/.test(v) === false))
      return "Must be numeric.";
  },
  'string': function(v) {
    if (typeof v != 'string')
      return "Must be a string.";
  },
  id: function(v) {
    return validators.int(v);
  },
  url: function(v) {
    if (typeof v != 'string' /* :TODO: more precise? */)
      return "Must be a valid URL.";
  },
  email: function(v) {
    if (typeof v != 'string' /* :TODO: more precise? */)
      return "Must be a valid email address.";
  },
  cardid: function(v) {
    if (typeof v != 'string' || /^\d{6,7}-\w{3}$/.test(v) === false)
      return "Must be a valid card id.";
  }
};

module.exports = validators;