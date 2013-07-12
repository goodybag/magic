#!/usr/bin/env node

var util    = require('util');
var async   = require('async');
var db      = require('../db');
var elastic = require('../lib/elastic-search');

var options = {
  rateLimit: 50
}

var productQueryOptions = {
  fields: ['products.*', 'businesses.name as businessName']

, $leftJoin: {
    businesses: {
      'businesses.id': 'products.businessId'
    }
  }
};

var stats = {
  'Number Completed': 0
};

var outputStats = function(){
  console.log("\n\n")
  for (var key in stats){
    console.log(key, stats[key]);
  }
  console.log("\n\n")
};

var complete = function(error){
  outputStats();
  if (error) throw error;
  process.exit(0)
}

console.log("Finding Products");

db.api.products.find({}, productQueryOptions, function(error, products){
  if (error) throw error;

  console.log("Found", products.length, "products");
  console.log("\n\n");

  async.series(
    products.map(function(product){
      return function(done){
        elastic.save('product', product, function(error){
          if (error) return done(error);
          util.print('.');
          stats['Number Completed']++;
          done();
        });
      };
    })
  , complete
  );
});