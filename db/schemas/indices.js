/**
 * Indices Schema (spans multiple tables)
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var indices = {
    locations_latlon_idx: {
      table   : 'locations'
    , using   : 'gist'
    , columns : '(ll_to_earth(lat, lon))'
    }
  };
  return indices;
});

