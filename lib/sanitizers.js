
var sanitizers = {
  'int': function(v) { 
    return parseInt(v, 10);
  },
  'float': function(v) { 
    return parseFloat(v, 10);
  },
  'string': function(v) {
    return ''+v;
  },
  'bool': function(v) {
    if (typeof v == 'string')
      return (v !== 'false');
    if (typeof v == 'number')
      return (+v) !== 0;
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