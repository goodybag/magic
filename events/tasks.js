/**
 * Listeners for tasks that need to be carried out internally after events
 */

var
  db        = require('../db')
, utils     = require('../lib/utils')
, sql       = require('../lib/sql')
, magic     = require('../lib/magic')
, config    = require('../config')
, templates = require('../templates')

, logger    = require('../lib/logger')({ app: 'api', component: 'activity' })

, TAGS = ['events', 'tasks']
;

module.exports = {
  'consumers.registered':
  function (consumer){
    db.api.collections.setLogTags(['tasks-consumers-registered-event', 'consumer-'+consumer.id]);

    db.api.collections.insert({
      userId:consumer.id
    , name:'Uncategorized'
    , isHidden:true
    , pseudoKey:'uncategorized'
    });

    db.api.collections.setLogTags(['tasks-consumers-registered-event', 'consumer-'+consumer.id]);

    db.api.collections.insert({
      userId:consumer.id
    , name:'Food'
    , isHidden:false
    , pseudoKey:'food'
    });

    magic.emit('debug.newConsumerCollectionsCreated', consumer);
  }

  // Email jag or something about the business contacting us
, 'business.contacted':
  function (info){
    utils.sendMail(
      config.emailFromAddress
    , config.emailFromAddress
    , 'Business Contacted Us'
    , JSON.stringify(info, true, '  ')
    );
  }

, 'loyalty.settingsUpdate':
  function (id, body, changes) {
    if (changes == null) return;
    var eliteChanged = changes.new_elite < changes.old_elite;
    var regularChanged = changes.new_regular < changes.old_regular;

    if (!eliteChanged && !regularChanged) return;


    var query = sql.query('UPDATE "userLoyaltyStats" SET '
      + '"numRewards" = "numRewards" + ("numPunches" / (CASE WHEN "isElite" IS TRUE THEN {eliteRequired} ELSE {regularRequired} END)), '
      + '"numPunches" = "numPunches" % (CASE WHEN "isElite" IS TRUE THEN {eliteRequired} ELSE {regularRequired} END) '
      + '{where}');

    query.where = sql.where('"businessId" = {id}');
    if (eliteChanged !== regularChanged)
      query.where = query.where.and('"isElite" IS ' + (eliteChanged ? 'TRUE' : 'FALSE'));

    console.log('query where: ', query.where);

    query.id = id;

    query.eliteRequired = changes.new_elite;
    query.regularRequired = changes.new_regular;

    console.log("query: ", query.toString());
    console.log("values: ", query.$values);

    var TAGS = ['loyalty-settings-update'];
    db.getClient(TAGS, function(error, client){
      if (error) return;
      client.query(query.toString(), query.$values, function(error, result){});
    });
  }
};
