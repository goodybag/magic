var URL = require('url');

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
  'object': function(v) {
    if (typeof v != 'object' || Array.isArray(v))
      return "Must be an object.";
  },

  id: function(v) {
    if(v.length > 10 || parseInt(v) >= 2147483648) {
      return "Must be valid integer.";
    }
    return validators.int(v);
  },
  url: function(v) {
    if (typeof v !== 'string' || !v.match(/^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i) || v.length > 2083)
      return "Must be a valid URL.";
  },
  email: function(v) {
    if (typeof v != 'string' || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) === false)
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
      return "Requires a valid `" + k + "` to be included in the request.";
  },

  'non-negative': function(v) {
    if (+v < 0)
      return "Must not be a negative value.";
  },
  'non-positive': function(v) {
    if (+v > 0)
      return "Must not be a positive value.";
  },

  'group': function(v, inputs){
    if (typeof v === 'string') v = parseInt(v);
    if (typeof v === 'number' && !(v <= 0 || v > 0))
      return "Invalid group value: NaN";
    if (typeof v !== 'object' && typeof v !== 'number')
      return "Group values must be a number or an object containing an id property";
    if (typeof v === 'object' && v != null){
        v.id = parseInt(v.id);
        if (typeof v.id === 'number' && !(v.id <= 0 || v.id > 0))
          return "Group values must be a number or an object containing an id property";
    }
  },

  'min': function(v, inputs, k, schema, args){
    if ((v == '' || v == null || v == undefined) && !schema.required) return;

    if (['int', 'id'].indexOf(schema.type) > -1) v = parseInt(v);
    else if (schema.type == 'float') v = parseFloat(v);

    if (schema.type == 'string' && v.length < args[0])
      return "`" + k + "` must be at least " + args[0] + " character" + (args[0].length > 1 ? "s" : "") + " long.";

    if (['int', 'id', 'float'].indexOf(schema.type) > -1 && v < args[0])
      return "`" + k + "` must be at least " + args[0] + ".";
  },

  'max': function(v, inputs, k, schema, args){
    if ((v == '' || v == null || v == undefined) && !schema.required) return;

    if (['int', 'id'].indexOf(schema.type) > -1) v = parseInt(v);
    else if (schema.type == 'float') v = parseFloat(v);

    if (schema.type == 'string' && v.length > args[0])
      return "`" + k + "` cannot be greater than " + args[0] + " character" + (args[0].length > 1 ? "s" : "") + " long.";

    if (['int', 'id', 'float'].indexOf(schema.type) > -1 && v > args[0])
      return "`" + k + "` cannot be greater than " + args[0] + ".";
  }
};

module.exports = validators;