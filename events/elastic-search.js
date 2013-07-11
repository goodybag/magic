var db      = require('../db')
var elastic = require('../lib/elastic-search')
var utils   = require('../lib/utils');

module.exports = {
  'products.create':
  function(product){
    elastic.save( 'product', product );
  }

, 'products.update':
  function(productId){
    db.api.products.findOne( productId, function(error, product){
      if (error) return;
      elastic.save( 'product', product );
    });
  }

, 'products.deleted':
  function(productId){
    console.log("product deleted", productId)
    elastic.del( 'product', productId );
  }

, 'business.created':
  function(business){
    elastic.save( 'business', business );
  }

, 'business.updated':
  function(business){
    elastic.save( 'business', business );
  }

, 'business.deleted':
  function(businessId){
    elastic.del( 'business', businessId );
  }

, 'category.created':
  function(category){
    elastic.save( 'category', category );
  }

, 'category.updated':
  function(category){
    elastic.save( 'category', category );
  }

, 'category.deleted':
  function(categoryId){
    elastic.del( 'category', categoryId );
  }
};