var db      = require('../db')
var elastic = require('../lib/elastic-search')
var utils   = require('../lib/utils');

module.exports = {
  'product.created':
  function(product){}

, 'product.updated':
  function(product){}

, 'product.deleted':
  function(product){}

, 'business.created':
  function(business){}

, 'business.updated':
  function(business){}

, 'business.deleted':
  function(business){}

, 'category.created':
  function(category){}

, 'category.updated':
  function(category){}

, 'category.deleted':
  function(category){}
};