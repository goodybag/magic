/**
 * Elastic Search Route Module for Products Searching
 */

var
  db          = require('../../db')
, sql         = require('../../lib/sql')
, utils       = require('../../lib/utils')
, errors      = require('../../lib/errors')
, magic       = require('../../lib/magic')
, elastic     = require('../../lib/elastic-search')
, Transaction = require('pg-transaction')
, async       = require('async')
, config      = require('../../config')
, qHelpers    = require('./query-helpers')

, logger  = {}

, schemas    = db.schemas
;

module.exports = function(req, res){
  var includes = req.param('include') || [];

  var searchOptions = {
    query: {
      multi_match: {
        query: req.param('query')
      , fields: [
          'name'
        , 'name.name'
        , 'name.partial'
        , 'businessName'
        , 'businessName.businessName'
        , 'businessName.partial'
        ]
      }
    }

  , size: req.param('limit')
  , from: req.param('offset') || 0
  };

  if (req.param('hasPhoto') == undefined || req.param('hasPhoto') == true) {
    searchOptions.query.constant_score = {
      filter: { exists: { field: 'photoUrl' } }
    };
  }

  var query = sql.query([
    '{withs}',
    'SELECT {fields} FROM products',
      '{sortCacheJoin} {prodLocJoin} {tagJoin} {collectionJoin} {feelingsJoins} {inCollectionJoin} {locationsJoin} {idScoreJoin}',
      'INNER JOIN businesses ON businesses.id = products."businessId"',
      '{where}',
      'GROUP BY {groupby}',
      '{sort} {limit}'
  ]);

  query.withs   = sql.withs();
  query.where   = sql.where();
  query.groupby = sql.fields().add('products.id').add('businesses.id');
  query.fields  = sql.fields()
    .add('products.*')
    .add('businesses.name as "businessName"')
    .add('businesses."isGB" as "businessIsGB"');

  if (req.session.user) qHelpers.feelings( query, req.session.user.id );

  if ( includes.indexOf('categories') > -1 ) qHelpers.categories( query );

  elastic.search('product', searchOptions, function(error, results){
    if (error) return res.error(errors.internal.DB_FAILURE, error);

    // Return results straight from elastic search
    if (req.param('bypass') || results.hits.total == 0) {
      return res.json({
        error: null

      , data: results.hits.hits.map(function(result){
          result._source._type  = result._type;
          result._source._score = result._score;

          return result._source;
        })

      , meta: {
          total:      results.hits.total
        , max_score:  results.hits.max_score
        }
      });
    }

    var scores = [];
    var ids = results.hits.hits.map(function(result){
      scores.push( result._score );
      return result._source.id;
    });
    var joinedIds = ids.join(', ');

    query.where.and( 'products.id in (' + joinedIds + ')' );

    // Add in query to join against for orderying
    query.fields.add('id_score.score as _score');

    query.withs.add(
      "id_score as ( select unnest(array[" + joinedIds + "]) as id, "
    + "unnest(array[" + scores.join(', ') + "]) as score )"
    );

    query.idScoreJoin = 'left join id_score on id_score.id = products.id';
    query.sort = 'order by id_score.score desc';
    query.groupby.add('id_score.score');


    db.query(query, function(error, rows, result){
      if (error) return res.error(errors.internal.DB_FAILURE, error);

      var total = 0, userLikes = 0, userWants = 0, userTries = 0;

      if (result.rowCount !== 0) {
        total = result.rows[0].metaTotal;
        userLikes = result.rows[0].metaUserLikes;
        userWants = result.rows[0].metaUserWants;
        userTries = result.rows[0].metaUserTries;
      }

      res.json({
        error: null
      , data: result.rows
      , meta: {
          total:      results.hits.total
        , userLikes:  userLikes
        , userWants:  userWants
        , userTries:  userTries
        }
      });
    });
  });
};