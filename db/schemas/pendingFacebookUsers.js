/**
 * Tapins Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var tapins = {
    facebookId: {
      type: 'bigint'
    , meta: 'primary key'
    }
  , cardId: {
      type: 'text'
    }
  , pending: {
      type: 'boolean'
    }
  };
  return tapins;
});