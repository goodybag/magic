#!/usr/bin/env node

var fs      = require('fs');
var util    = require('util');
var async   = require('async');
var db      = require('../db');
var elastic = require('../lib/elastic-search');

var options = {
  logFile:    __dirname + '/../logs/elastic-search-update.log'
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

    var $where = {
      // $notNull: ['photoUrl']
    };

    db.api.products.find($where, productQueryOptions, function(error, products){
      if (error) throw error;

      console.log("Found", products.length, "products");
      console.log("\n\n");

      var run, next, i = 0;

      (run = function(callback){
        elastic.save('product', products[i++], callback);
      })(next = function(error){
        if (error) {
          util.print('x');
          stats['Errors']++;
          logs.errors.push(error);
        } else {
          util.print('.');
          stats['Number Completed']++;
        }

        if (products.length == i) return complete();

        run(next);
      });
    });
  });
});