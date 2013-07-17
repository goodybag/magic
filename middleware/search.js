var elastic = require('../lib/elastic-search');

var fields = {
  product: [
    'name.name'
  , 'name.partial'
  , 'businessName.businessName'
  , 'businessName.partial'
  ]
};

module.exports = function(type){
  return function(req, res, next){
    if (!req.param('search')) return next();

    var searchOptions = {
      query: {
        multi_match: {
          query: req.param('search')
        , fields: fields[ type ]
        }
      }

    , size: req.param('limit')  || 30
    , from: req.param('offset') || 0
    };

    return elastic.search('product', searchOptions, function(error, results){
      if (error) return res.error(errors.internal.DB_FAILURE, error), logger.routes.error(TAGS, error);

      var ids = [];
      var formattedResults = results.hits.hits.map(function(result){
        result._source._type  = result._type;
        result._source._score = result._score;

        ids.push( result._source.id );

        return result._source;
      });

      req._search = {
        ids:      ids
      , results:  formattedResults
      , _results: results
      , meta: {
          total:      results.hits.total
        , max_score:  results.hits.max_score
        }
      };

      next();
    });
  };
};