/**
 * Listeners for all the events that we want to store in the log
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, sql     = require('../lib/sql')

, logger  = require('../lib/logger')({ app: 'api', component: 'events' })

, insert = function(type, data, callback){
    var TAGS = ['store-events', type];

    callback = callback || utils.noop;

    db.getClient(function(error, client){
      if (error) return logger.error(TAGS, error);

      var inputs = {
        type: type
      , date: new Date()
      };

      var query = sql.query('insert into events ({fields}) values ({values})');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);

      query.fields.add('"data"');
      query.values.add(sql.hstoreValue(data));

      client.query(query.toString(), query.$values, function(error){
        if (error) return logger.error(TAGS, error);

        callback();
      });
    });
  }
;

module.exports = {
  'consumers.registered':
  function(consumer){
    insert('consumers.registered', { consumerId: consumer.consumerId });
  }

// , 'consumers.donation':
//   function(consumer, donation){
//     insert('consumers.donation', {
//       consumerId: consumer.id
//     , donationId: donation.id
//     , amount:     donation.amount
//     });
//   }

, 'products.like':
  function(userId, productId){
    insert('products.like', { userId: userId, productId: productId });
  }
};