/**
 * Oddity Businesses Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var oddityMeta = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    }
    , oddityLiveId: {
      type: 'int'
    , meta: 'references "oddityLive"(id)'
    }
    , businessId: {
      type: 'int'
    , meta: 'references businesses(id)'
    }
    , userId: {
      type: 'int'
    , meta: 'references users(id)'
    }
    , locationId: {
      type: 'int'
    , meta: 'references locations(id)'
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
  return oddityMeta;
});