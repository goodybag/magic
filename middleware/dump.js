var 
  logger = {
    routes: require('../lib/logger')({app: 'api', component: 'routes'})
  }
;


module.exports = function(req, res, next){
  var TAGS = [req.uuid, 'dump'];

  var data = {
    headers: req.headers
  , params: req.params
  , query: req.query
  , body: req.body
  };

  logger.routes.debug(TAGS, data);
  next();
};
