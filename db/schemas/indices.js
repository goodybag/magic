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
    activity_id_idx: {
      table   : 'activity'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , businesses_id_idx: {
      table   : 'businesses'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , businesses_isDeleted_idx: {
      table   : 'businesses'
    , columns : '("isDeleted")'
    }
  , businessLoyaltySettings_businessId_idx: {
      table   : 'businessLoyaltySettings'
    , type    : 'UNIQUE'
    , columns : '("businessId")'
    }
  , businessTags_businessId_idx: {
      table   : 'businessTags'
    , columns : '("businessId")'
    }
  , cashiers_userId_idx: {
      table   : 'cashiers'
    , type    : 'UNIQUE'
    , columns : '("userId")'
    }
  , collections_id_idx: {
      table   : 'collections'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , collections_userId_idx: {
      table   : 'collections'
    , columns : '("userId")'
    }
  , consumers_userId_idx: {
      table   : 'consumers'
    , type    : 'UNIQUE'
    , columns : '("userId")'
    }
  , events_id_idx: {
      table   : 'events'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , groups_id_idx: {
      table   : 'groups'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , locations_id_idx: {
      table   : 'locations'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , locations_latlon_idx: {
      table   : 'locations'
    , using   : 'gist'
    , columns : '(ll_to_earth(lat, lon))'
    }
  , managers_userId_idx: {
      table   : 'managers'
    , type    : 'UNIQUE'
    , columns : '("userId")'
    }
  , photos_id_idx: {
      table   : 'photos'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productCategories_id_idx: {
      table   : 'productCategories'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productLikes_id_idx: {
      table   : 'productLikes'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productLikes_productId_idx: {
      table   : 'productLikes'
    , columns : '("productId")'
    }
  , productLocations_id_idx: {
      table   : 'productLocations'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productLocations_productId_idx: {
      table   : 'productLocations'
    , columns : '("productId")'
    }
  , products_id_idx: {
      table   : 'products'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productsCollections_id_idx: {
      table   : 'productsCollections'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productsCollections_collectionId_idx: {
      table   : 'productsCollections'
    , columns : '("collectionId")'
    }
  , productsProductCategories_id_idx: {
      table   : 'productsProductCategories'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productsProductCategories_productId_idx: {
      table   : 'productsProductCategories'
    , columns : '("productId")'
    }
  , productsProductCategories_productCategoryId_idx: {
      table   : 'productsProductCategories'
    , columns : '("productCategoryId")'
    }
  , productsProductTags_id_idx: {
      table   : 'productsProductTags'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productsProductTags_productId_idx: {
      table   : 'productsProductTags'
    , columns : '("productId")'
    }
  , productsProductTags_productTagId_idx: {
      table   : 'productsProductTags'
    , columns : '("productTagId")'
    }
  , productTags_id_idx: {
      table   : 'productTags'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productTries_id_idx: {
      table   : 'productTries'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productTries_productId_idx: {
      table   : 'productTries'
    , columns : '("productId")'
    }
  , productWants_id_idx: {
      table   : 'productWants'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , productWants_productId_idx: {
      table   : 'productWants'
    , columns : '("productId")'
    }
  , sessions_id_idx: {
      table   : 'sessions'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , tapins_id_idx: {
      table   : 'tapins'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , tapinStations_id_idx: {
      table   : 'tapinStations'
    , type    : 'UNIQUE'
    , columns : '("userId")'
    }
  , users_id_idx: {
      table   : 'users'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , users_singlyId_idx: {
      table   : 'users'
    , type    : 'UNIQUE'
    , columns : '("singlyId")'
    }
  , users_email_idx: {
      table   : 'users'
    , type    : 'UNIQUE'
    , columns : '(email)'
    }
  , usersGroups_id_idx: {
      table   : 'usersGroups'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  , usersGroups_userId_idx: {
      table   : 'usersGroups'
    , columns : '("userId")'
    }
  , visits_id_idx: {
      table   : 'visits'
    , type    : 'UNIQUE'
    , columns : '(id)'
    }
  };
  return indices;
});

