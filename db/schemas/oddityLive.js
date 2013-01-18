/**
 * Oddity Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var oddityLive = {
    id: {
      type: 'int'
      , meta: 'primary key'
    }
    , biz_name: {
      type: 'text'
    }
    , cat_primary: {
      type: 'text'
    }
    , cat_sub: {
      type: 'text'
    }
    , cat_sub2: {
      type: 'text'
    }
    , cat_sub3: {
      type: 'text'
    }
    , web_url: {
      type: 'text'
    }
    , e_address: {
      type: 'text'
    }
    , e_city: {
      type: 'text'
    }
    , e_state: {
      type: 'text'
    }
    , e_postal: {
      type: 'text'
    }
    , e_country: {
      type: 'text'
    }
    , loc_county: {
      type: 'text'
    }
    , loc_area_code: {
      type: 'text'
    }
    , loc_FIPS: {
      type: 'text'
    }
    , loc_MSA: {
      type: 'text'
    }
    , loc_PMSA: {
      type: 'text'
    }
    , loc_TZ: {
      type: 'text'
    }
    , loc_DST: {
      type: 'text'
    }
    , loc_LAT_centroid: {
      type: 'text'
    }
    , loc_LAT_poly: {
      type: 'text'
    }
    , loc_LONG_centroid: {
      type: 'text'
    }
    , loc_LONG_poly: {
      type: 'text'
    }
    , biz_popularity: {
      type: 'int'
    }
    , biz_atmosphere: {
      type: 'text'
    }
    , biz_hour: {
      type: 'text'
    }
    , biz_price: {
      type: 'text'
    }
    , flag_outdoorseating: {
      type: 'text'
    }
    , biz_phone: {
      type: 'text'
    }
    , biz_info: {
      type: 'text'
    }
  };
  return oddityLive;
});