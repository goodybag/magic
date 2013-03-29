/**
 * Admin
 */

var db          = require('../../db');
var Transaction = require('pg-transaction');
var async       = require('async');
var config      = require('../../config');

var logger = {
  routes: require('../../lib/logger')({app: 'api', component: 'routes'})
};

module.exports.getRebuildPopularListInterface = function(req, res) {
  res.send([
    '<form action="/v1/admin/algorithms/popular" method="post">Rebuild Popular List: <input type="submit" /></form>'
  ].join(''));
};

module.exports.rebuildPopularList = function(req, res) {
  var TAGS = ['rebuild-popular-list', req.uuid];

  db.getClient(TAGS, function(error, client){
    if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

    var tx = new Transaction(client);
    tx.begin(function(error) {
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      // lock our target
      tx.query('SELECT id FROM "poplistItems" WHERE "isActive" = true FOR UPDATE NOWAIT', function(error) {
        // errors should actually occur if the rows were previously locked
        if (error) return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

        // deprecate old lists
        tx.query('UPDATE "poplistItems" SET "isActive" = false WHERE "isActive" = true', function(error) {
          if (error) return tx.abort(), res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

          tx.commit(function(err) {
            if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

            var fullList = [];
            var makeList = function(listid, cb) {
              // get the current productset
              client.query('SELECT id, "businessId" as bid FROM products WHERE "photoUrl" IS NOT NULL ORDER BY products.likes DESC', function(error, results) {
                if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
                if (results.rowCount === 0) return res.error(errors.internal.DB_FAILURE, 'no products returned'), logger.routes.error(TAGS, 'Error while selecting products: no products returned');

                var products = results.rows;
                var makeSample = function(n, x, y) {
                  var bizUses = {}; // tracks how many times we've pulled from a business' products
                  var pids = [], nPids = 0;

                  if (typeof n == 'undefined')
                    n = products.length;
                  if (typeof x == 'undefined')
                    x = products.length;
                  if (typeof y == 'undefined')
                    y = 1000000; // use a business however much you want

                  // create a randomized list of indices, 1 for each item in the range
                  var list = shuffle(range(x));
                  for (var i = 0; i < x; i++) {
                    var product = products[list[i]];
                    if (!product)
                      continue;

                    // check if we've gotten too many from this business already
                    var numTakenFromBiz = bizUses[product.bid];
                    if (typeof bizUses[product.bid] == 'undefined')
                      bizUses[product.bid] = 0;
                    if ((bizUses[product.bid]++) >= y)
                      continue;

                    // it works, splice the product out
                    products.splice(list[i], 1);
                    pids.push({ pid:product.id, listid:listid });
                    if ((++nPids) >= n)
                      break;
                  }

                  return pids;
                };

                // build the list
                var list = []
                  .concat(makeSample(5,   20,  1))
                  .concat(makeSample(10,  50,  3))
                  .concat(makeSample(15,  100, 3))
                  .concat(makeSample(20,  150, 4))
                  .concat(makeSample(100, 300, 5))
                  .concat(makeSample())
                  // :DEBUG: the straight list
                  // .concat(products.map(function(p) { return { pid:p.id, listid:listid }; }))
                  ;

                fullList = fullList.concat(list);
                cb();
              });
            };

            // make the lists
            async.each(range(config.algorithms.popular.numLists), makeList, function(error) {
              insertListItems(client, fullList, function(error) {
                if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);
                res.send("popular lists updated successfully");
              });
            });
          });
        });
      });
    });
  });
};

function range(n) {
  var arr = [];
  for (var i=0; i < n; i++)
    arr.push(i);
  return arr;
}

// http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling
function shuffle(array) {
    var tmp, current, top = array.length;
    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
    return array;
}

function insertListItems(client, list, cb) {
  var doNext = function() {
    var item = list.pop();
    if (!item) { return cb(); }

    client.query(
      'INSERT INTO "poplistItems" (listid, "productId", "createdAt", "isActive") SELECT $1, $2, now(), true',
      [item.listid, item.pid],
      function(err, result) {
        if (err) return cb(err);
        if (result.rowCount === 0) return cb('Failed to insert item', item);
        doNext();
      }
    );
  };
  doNext();
}