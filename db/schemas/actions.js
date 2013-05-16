/**
 * Actions Schema
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require){
  var actions = {
    id: {
      type: 'serial'
    , meta: 'primary key'
    },
    type: {
      type: 'text'
    },
    dateTime: {
      type: 'timestamp'
    },
    userId: {
      type: 'int'
    },
    productId: {
      type: 'int'
    },
    //the application which sourced this event
    //examples: 'magic' | 'merlin' | 'gandalf'
    source: {
      type: 'text',
    },
    //version of the source application
    sourceVersion: {
      type: 'text'
    },
    deviceId: {
      type: 'text'
    },
    locationId: {
      type: 'int'
    },
    data: {
      type: 'json'
    }
  };
  return actions;
});
