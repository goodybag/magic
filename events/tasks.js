/**
 * Listeners for tasks that need to be carried out internally after events
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')
, magic   = require('../lib/magic')

, logger  = require('../lib/logger')({ app: 'api', component: 'activity' })

, TAGS = ['events', 'tasks']
;

module.exports = {
  'consumers.registered':
  function (consumer){
    db.api.collections.setLogTags(['tasks-consumers-registered-event', 'consumer-'+consumer.id]);
    db.api.collections.insert({ userId:consumer.id, name:'Uncategorized', isHidden:true, pseudoKey:'uncategorized' });
    db.api.collections.setLogTags(['tasks-consumers-registered-event', 'consumer-'+consumer.id]);
    db.api.collections.insert({ userId:consumer.id, name:'Fashion', isHidden:false, pseudoKey:'fashion' });
    db.api.collections.setLogTags(['tasks-consumers-registered-event', 'consumer-'+consumer.id]);
    db.api.collections.insert({ userId:consumer.id, name:'Food', isHidden:false, pseudoKey:'food' });
    magic.emit('debug.newConsumerCollectionsCreated', consumer);
  }
};