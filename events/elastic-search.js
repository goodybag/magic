var db      = require('../db')
var elastic = require('../lib/elastic-search')
var utils   = require('../lib/utils');

module.exports = {
  'product.created':
  function(product){
    elastic.index( 'product', product );
  }

, 'product.updated':
  function(product){
    elastic.index( 'product', product );
  }

, 'product.deleted':
  function(productId){
    elastic.del( 'product', productId );
  }

, 'business.created':
  function(business){
    elastic.index( 'business', business );
  }

, 'business.updated':
  function(business){
    elastic.index( 'business', business );
  }

, 'business.deleted':
  function(businessId){
    elastic.del( 'business', businessId );
  }

, 'category.created':
  function(category){
    elastic.index( 'category', category );
  }

, 'category.updated':
  function(category){
    elastic.index( 'category', category );
  }

, 'category.deleted':
  function(categoryId){
    elastic.del( 'category', categoryId );
  }
};