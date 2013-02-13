
var sanitizers = {
  'int': function(v) { 
    return parseInt(v, 10);
  },
  'string': function(v) {
    return ''+v;
  },
  'bool': function(v) {
    return !!v;
  },
  id: function(v) {
    return parseInt(v, 10);
  },
  url: function(v) {
    return ''+v;
  },
  email: function(v) {
    return ''+v;
  },
  cardid: function(v) {
    return ''+v;
  }
};

module.exports = sanitizers;