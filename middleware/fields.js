var errors = require('../lib/errors');
module.exports = function(fields) {
  return function(req, res, next){
    var
      groups        = ["default"]
    , allowedFields = {}
    , noneAllowed   = true
    ;

    // get user groups
    if (req.session && req.session.user) groups = groups.concat(req.session.user.groups);

    // merge the fields available based on groups
    for (var i = groups.length - 1; i >= 0; i--){
      var group = groups[i];
      if (!group || !fields[group]) { continue; } // sanity check
      for (var fieldName in fields[group]) {
        if (!(fieldName in allowedFields)) { // not already added?
          allowedFields[fieldName] = fields[group][fieldName];
          noneAllowed = false;
        }
      }
    }
    if (noneAllowed) return res.json({ error: errors.auth.DATA_PERMISSIONS, data:null });

    // filter request body based on allowed fields
    var data = {};
    for (var fieldName in req.body) {
      if (!allowedFields.hasOwnProperty(fieldName)) continue;
      data[fieldName] = req.body[fieldName];
    }

    // attach field-data to the request
    req.fields = allowedFields;
    req.body   = data;
    next();
  };
};