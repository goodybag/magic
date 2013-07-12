#!/usr/bin/env node

var async   = require('async');
var db      = require('../db');
var elastic = require('../lib/elastic-search');

var productQueryOptions = {
  order: 'id asc'
};

db.products.find({}, productQueryOptions, function(error, products){
  if (error) throw error;

  async.parallel(
    products.map(function(product){
      return function(done){
        elastic.save(product, done);
      };
    })
  , function(error){

    }
  );

  products.forEach(function(product){
    db.elastic.save('product', product)
  });
});