#!/usr/bin/env node

var fs      = require('fs');
var util    = require('util');
var async   = require('async');
var db      = require('../db');
var elastic = require('../lib/elastic-search');

var options = {
  logFile:    '../logs/elastic-search-update.log'
};

var productQueryOptions = {
  fields: ['products.*', 'businesses.name as "businessName"']

, $leftJoin: {
    businesses: {
      'businesses.id': 'products.businessId'
    }
  }
};

var stats = {
  'Number Completed': 0
, 'Errors':           0
};

var logs = {
  errors: []
};

var outputStats = function(){
  console.log("\n\n")
  for (var key in stats){
    console.log(key, stats[key]);
  }
  console.log("\n\n")
};

var outputLogs = function(){
  if (logs.errors.length == 0) return;

  fs.writeFileSync( options.logFile, JSON.stringify( logs.errors, true, '  ' ) );
};

var complete = function(error){
  outputLogs();
  outputStats();
  if (error) throw error;
  process.exit(0)
}

console.log("Destroying old");

elastic.removeSelf(function(error){
  console.log("Finding Products");

  elastic.ensureIndex(function(error){
    if (error) throw error;

    db.api.products.find({}, productQueryOptions, function(error, products){
      if (error) throw error;

      console.log("Found", products.length, "products");
      console.log("\n\n");

      var i = 0;

      (function(next){
        products = products.map(function(product){
          return function(){
            elastic.save('product', product, next);
          };
        })
      })(function(error){
        if (error) {
          util.print('x');
          stats['Errors']++;
          logs.errors.push(error);
        } else {
          util.print('.');
          stats['Number Completed']++;
        }

        if (products.length == i) return complete();

        products[i++]();
      });

      products[i++]();
    });
  });
});