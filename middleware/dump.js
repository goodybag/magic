var 
  logger = {
    middleware: require('../lib/logger')({app: 'api', component: 'middleware'})
  }
;


module.exports = function(req, res, next){
  var TAGS = [req.uuid, 'dump'];

  var data = {
    url: req.url
  , method: req.method
  , headers: req.headers
  , params: req.params
  , query: req.query
  , body: req.body
  };

  logger.middleware.debug(TAGS, data);
  next();
};
