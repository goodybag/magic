module.exports = function(fields) {
  return function(req, res, next){
    var group = "default";
    if (req.session && req.session.user) group = req.session.user.group;
    if (fields && fields[group]){
      if (fields[group].length === 0) return res.json({ error: null, data: [] });
      req.fields = fields[group];
      next();
    }
  };
};