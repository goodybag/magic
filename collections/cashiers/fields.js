var db = require('../../db');
var users = db.tables.users;
var usersGroups = db.tables.usersGroups;
var cashiers = db.tables.cashiers;

var $postRequires = function(req, res){
  var required = [
    'locationId'
  , 'businessId'
  ];

  // Check how they're creating this user
  if (req.body.email){
    required.push('email', 'password');
  } else if (req.body.singlyId){
    required.push('singlyAccessToken', 'singlyId');
  } else {
    required.push('userId');
  }

  return required;
};

module.exports = {
  "default": {
    $postRequires : $postRequires
  }

, "admin": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , singlyId            : users.singlyId
  , singlyAccessToken   : users.singlyAccessToken
  , cashierId           : cashiers.id
  , businessId          : cashiers.businessId
  , locationId          : cashiers.locationId
  , cardId              : cashiers.cardId
  }

, "sales": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , singlyId            : users.singlyId
  , singlyAccessToken   : users.singlyAccessToken
  , cashierId           : cashiers.id
  , businessId          : cashiers.businessId
  , locationId          : cashiers.locationId
  , cardId              : cashiers.cardId
  }

, "owner": {
    $postRequires       : $postRequires
  , userId              : users.id
  , email               : users.email
  , password            : users.password
  , singlyId            : users.singlyId
  , singlyAccessToken   : users.singlyAccessToken
  , cashierId           : cashiers.id
  , businessId          : cashiers.businessId
  , locationId          : cashiers.locationId
  , cardId              : cashiers.cardId
  }
};