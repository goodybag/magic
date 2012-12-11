/**
 * Schemas.Db.Consumer
 */

module.exports = {
  type: 'object'
, properties: {
    firstName: {
      type: "string"
    }
  , lastName: {
     type: "string"
    }
  , screenName: {
     type: "string"
    , minLength: 5
    }
  , email: {
     type: "string"
    , minLength: 3
    , pattern: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    }
  , password: {
     type: "string"
    , minLength: 60
    , maxLength: 60
    }
  }
};