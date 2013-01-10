/**
 * Oddity Businesses Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var oddityBusinesses = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
    , oddityId: {
      type: 'int'
    }
    , businessId: {
      type: 'int'
    }
    , locationId: {
      type: 'int'
    }
    , toReview: {
      type: 'boolean'
    }
    , isHidden: {
      type: 'boolean'
    }
    , lastUpdated: {
      type: 'timestamp'
    }
    , changeColumns: {
      type: 'boolean'
    }
    , hiddenBy: {
      type: 'text'
    }
    , reviewedBy: {
      type: 'text'
    }
  };
  return oddityBusinesses;
});