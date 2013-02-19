/**
 * Listeners for tasks that need to be carried out internally after events
 */

var
  db      = require('../db')
, utils   = require('../lib/utils')

, logger  = require('../lib/logger')({ app: 'api', component: 'activity' })

, TAGS = ['events', 'tasks']
;

module.exports = {
  'consumers.registered':
  function (consumer){
    db.api.collections.insert({ userId:consumer.id, name:'Fashion' });
    db.api.collections.insert({ userId:consumer.id, name:'Food' });
  }
};