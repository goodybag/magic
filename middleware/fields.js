/**
 * Narrows down available fields based on current permissions
 *
 * req.fields - An array of sql table fields available
 * req.fieldNames - An array of field names that are available
 */

var
  db = require('../db')

, tables = {
    businesses : db.tables.businesses
  , locations  : db.tables.locations
  , users      : db.tables.users
  }


, fields = {
    "businesses": {
      default: [
        'id'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'enabled'
      ]

    , client: [
        'id'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      ]

    , sales: [
        'id'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'enabled'
      , 'cardCode'
      ]

    , admin: [
        'id'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'enabled'
      , 'cardCode'
      ]
    }

  , "locations": {
      default: [
        'id'
      , 'businessId'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'country'
      , 'phone'
      , 'fax'
      , 'lat'
      , 'lon'
      , 'enabled'
      ]

    , client: [
        'id'
      , 'businessId'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'country'
      , 'phone'
      , 'fax'
      , 'lat'
      , 'lon'
      , 'enabled'
      ]

    , sales: [
        'id'
      , 'businessId'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'country'
      , 'phone'
      , 'fax'
      , 'lat'
      , 'lon'
      ]

    , admin: [
        'id'
      , 'businessId'
      , 'name'
      , 'street1'
      , 'street2'
      , 'city'
      , 'state'
      , 'zip'
      , 'country'
      , 'phone'
      , 'fax'
      , 'lat'
      , 'lon'
      , 'enabled'
      ]
    }

  , "users": {
      default: [
        'id'
      ]

    , admin: [
        'id'
      , 'email'
      , 'password'
      ]
    }

  , "products": {
      "default": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isArchived
      , products.isEnabled
      ]

    , "client": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isArchived
      , products.isEnabled
      ]

    , "sales": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isArchived
      , products.isEnabled
      ]

    , "admin": [
        products.id
      , products.businessId
      , products.name
      , products.description
      , products.price
      , products.isVerified
      , products.isArchived
      , products.isEnabled
      ]
    }
  }

, sqlFields = {}
;

// Make a version of fields that uses the node-sql objects
var groupFields;
for (var collection in fields){
  sqlFields[collection] = {};
  for (var group in fields[collection]){
    sqlFields[collection][group] = [];
    groupFields = fields[collection][group];
    for (var i = 0; i < groupFields.length; i++){
      sqlFields[collection][group].push(
        tables[collection][groupFields[i]]
      );
    }
  }
}

// This whole thing could be a lot more efficient
module.exports = function(collectionName){
  return function(req, res, next){
    var
      groups              = ["default"]
    , collection          = fields[collectionName]
    , sqlCollection       = sqlFields[collectionName]
    , availableFields     = []
    , availableFieldNames = []
    ;

    if (req.session && req.session.user) groups = req.session.user.groups;

    /**
     * This is a particularly slow algorithm
     * But it's ok because the dataset is super small
     */

    // Merge the fields available based on groups
    for (var i = groups.length - 1; i >= 0; i--){
      for (var n = collection[groups[i]].length - 1; n >= 0; n--){
        if (availableFields.indexOf(collection[groups[i]][n]) === -1){
          availableFields.push(sqlCollection[groups[i]][n]);
          availableFieldNames.push(collection[groups[i]][n]);
        }
      }
    }

    if (availableFieldNames.length === 0) return res.json({ error: null, data: [] });
    req.fields = availableFields;
    req.fieldNames = availableFieldNames;
    next();
  };
};

module.exports.fields = fields;
module.exports.sqlFields = sqlFields;