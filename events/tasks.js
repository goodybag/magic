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
    db.api.collections.insert({ userId:consumer.id, name:'All', isMagical:true });
    db.api.collections.insert({ userId:consumer.id, name:'Fashion', isMagical:true });
    db.api.collections.insert({ userId:consumer.id, name:'Food', isMagical:true });
  }

, 'consumers.addToCollection':
  function (consumerId, collectionId, productId) {
    var options = {
      fields: { 'productCategories.id': 'id', 'productCategories.name': 'name' },
      $innerJoin: { productCategories: { "productCategories.id": "productsProductCategories.productCategoryId" }}
    };
    db.api.productsProductCategories.find({ productId: productId }, options, function(error, result) {
      if (error) return logger.error(TAGS, error);

      add('All');
      result.forEach(function(row) {
        if (row.name.toLowerCase() == 'fashion')
          add('Fashion');
        if (row.name.toLowerCase() == 'food')
          add('Food');
      });
    });

    var add = function(name) {
      db.api.collections.findOne({ isMagical:true, name:name }, function(error, result) {
        if (error) return logger.error(TAGS, error);
        db.api.productsCollections.insert({ collectionId:result.id, productId:productId, createdAt:'now()' }, function(error, result) {
          if (error) return logger.error(TAGS, error);
          magic.emit('debug.productAutomagickedToCollection', { collectionId:result.id, collectionName:name, productId:productId, orgCollectionId:collectionId, consumerId:consumerId });
        });
      });
    };
    
  }
};