var
  sql   = require('../../lib/sql')
, utils = require('../../lib/utils')
;

module.exports.tags = function(query){
  query.fields.add([
    'array_to_json(array(SELECT row_to_json("productTags".*) FROM "productTags"',
      'INNER JOIN "productsProductTags"',
        'ON "productsProductTags"."productTagId" = "productTags".id',
        'AND "productsProductTags"."productId" = products.id',
    ')) as tags'
  ].join(' '));
};

module.exports.categories = function(query){
  query.fields.add([
    'array_to_json(array(SELECT row_to_json("productCategories".*) FROM "productCategories"',
      'INNER JOIN "productsProductCategories"',
        'ON "productsProductCategories"."productCategoryId" = "productCategories".id',
        'AND "productsProductCategories"."productId" = products.id',
    ')) as categories'
  ].join(' '));
};

/**
 * Adds the users feelings join on the products query
 * @param  {Query}  query   The standard silly-sql query object
 * @param  {Number} userId  The users id
 * @param  {Object} data    Data for the helper
 *
 */
module.exports.feelings = function(query, userId){
  query.feelingsJoins = [
    'LEFT JOIN "productLikes" ON products.id = "productLikes"."productId" AND "productLikes"."userId" = $userId',
    'LEFT JOIN "productWants" ON products.id = "productWants"."productId" AND "productWants"."userId" = $userId',
    'LEFT JOIN "productTries" ON products.id = "productTries"."productId" AND "productTries"."userId" = $userId'
  ].join(' ');

  query.fields.add('("productLikes".id IS NOT NULL) AS "userLikes"');
  query.fields.add('("productWants".id IS NOT NULL) AS "userWants"');
  query.fields.add('("productTries".id IS NOT NULL) AS "userTried"');
  query.fields.add('COUNT("productWants".id) OVER() as "metaUserWants"');
  query.fields.add('COUNT("productLikes".id) OVER() as "metaUserLikes"');
  query.fields.add('COUNT("productTries".id) OVER() as "metaUserTries"');

  query.groupby = query.groupby || sql.fields();

  query.groupby.add('"productLikes".id');
  query.groupby.add('"productWants".id');
  query.groupby.add('"productTries".id');

  query.$('userId', userId);
};

module.exports.total = function(query){
  query.fields.add('COUNT(*) OVER() as "metaTotal"');
};