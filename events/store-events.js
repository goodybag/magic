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
      , data: JSON.stringify(data).replace(/\'/g, "\\'")
      };

      var query = sql.query('insert into events ({fields}) values ({values})');
      query.fields = sql.fields().addObjectKeys(inputs);
      query.values = sql.fields().addObjectValues(inputs, query);

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

, 'consumers.donation':
  function(consumer, donation){
    insert('consumers.donation', {
      consumerId: consumer.id
    , donationId: donation.id
    , amount:     donation.amount
    });
  }

// , 'consumers.visit':
//   function(consumer){
//     console.log("Consumer visit!", consumer.id);
//   }

// , 'consumers.becameElite':
//   function(consumer){
//     console.log("Consumer becameElite!", consumer.id);
//   }

// , 'products.try':
//   function(consumer){
//     console.log("Consumer !", consumer.id);
//   }

// , 'products.like':
//   function(consumer){
//     console.log("Consumer donation!", consumer.id);
//   }

// , 'products.want':
//   function(consumer){
//     console.log("Consumer visit!", consumer.id);
//   }
};