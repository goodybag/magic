
var validators = {
  'int': function(v) { 
    if (typeof v != 'number' && (typeof v == 'string' && /^[0-9]+$/.test(v) === false))
      return "Must be numeric.";
  },
  'string': function(v) {
    if (typeof v != 'string')
      return "Must be a string.";
  },
  'bool': function(v) {
    if (typeof v != 'boolean' && (/^(0|1|false|true)$/.test(v) === false))
      return "Must be a boolean.";
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
  },
  'requires-email': function(v, inputs) {
    if (!inputs.email)
      return "Requires a valid `email` to be included in the request.";
  },
  'requires-singlyid': function(v, inputs) {
    if (!inputs.singlyId)
      return "Requires a valid `singlyId` to be included in the request.";
  }
};

module.exports = validators;