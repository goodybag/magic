var db      = require('../db')
var elastic = require('../lib/elastic-search')
var utils   = require('../lib/utils');

module.exports = {
  'products.create':
  function(product){
    var this_ = this;
    // Lookup business
    db.api.businesses.findOne( product.businessId, function(error, business){
      if (error) return;

      if (business) product.businessName = business.name;

      elastic.save( 'product', product, function(error, result){
        if (result) this_.emit('elastic-search.product.saved');
      });
    });
  }

, 'products.update':
  function(productId){
    var this_ = this;

    // Lookup product
    db.api.products.findOne( { 'products.id': productId }, {
      fields: ['products.*', 'businesses.name as "businessName"']
    , $leftJoin: {
        businesses: {
          'businesses.id': 'products.businessId'
        }
      }
    }, function(error, product){
      elastic.save( 'product', product, function(error, result){
        if (result) this_.emit('elastic-search.product.saved');
      });
    })
  }

, 'products.deleted':
  function(productId){
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