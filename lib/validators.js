
var validators = {
  'int': function(v) {
    if (typeof v != 'number' && (typeof v == 'string' && /^[0-9]+$/.test(v) === false))
      return "Must be numeric.";
  },
  'float': function(v) {
    if (typeof v != 'number' && (typeof v == 'string' && /^[0-9\.\-]+$/.test(v) === false))
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
    if (typeof v != 'string' && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/.test(v) === false)
      return "Must be a valid email address.";
  },
  cardid: function(v) {
    if (typeof v != 'string' || /^\d{6,7}-\w{3}$/.test(v) === false)
      return "Must be a valid card id.";
  },
  time: function(v) {
    if (/^[\d]{1,2}\:?[\d]{1,2} ?(am|pm)?$/i.test(v) === false)
      return "Must be a valid time.";
  },

  'requires-email': function(v, inputs) {
    if (!inputs.email)
      return "Requires a valid `email` to be included in the request.";
  },
  'requires-password': function(v, inputs) {
    if (!inputs.password)
      return "Requires a valid `password` to be included in the request.";
  },
  'requires-singlyid': function(v, inputs) {
    if (!inputs.singlyId)
      return "Requires a valid `singlyId` to be included in the request.";
  },
  'required-if-non-oauth': function(v, inputs, k) {
    if (!inputs.singlyId && !inputs.singlyAccessToken && !inputs[k])
      return "Requires a valid `" + k + "` to be included in the request."
  },

  'non-negative': function(v) {
    if (+v < 0)
      return "Must not be a negative value.";
  },
  'non-positive': function(v) {
    if (+v > 0)
      return "Must not be a positive value.";
  }
};

module.exports = validators;