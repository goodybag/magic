module.exports = function(permsFn) {
  if (!permsFn) { throw "Invalid perms function given to permissions middleware"; }
  return function(req, res, next){
    // run the provided permissions function
    permsFn(req, function(groups) {
      if (groups != null)
        req.permittedGroups = [].concat(groups);
      next();
    });
  };
};