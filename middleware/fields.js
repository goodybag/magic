var errors = require('../lib/errors');
var utils = require('../lib/utils');
module.exports = function(fields) {
  return function(req, res, next){
    var
      groups         = ["default"]
    , allowedFields  = {}
    , requiredFields = {}
    , noneAllowed    = true
    ;

    // get user groups
    if (req.session && req.session.user) groups = groups.concat(req.session.user.groups);

    // merge the fields available based on groups
    for (var i = groups.length - 1; i >= 0; i--){
      var group = groups[i];
      if (!group || !fields[group]) { continue; } // sanity check
      // extract allowed fields
      for (var fieldName in fields[group]) {
        if (fieldName.charAt(0) === '$') { continue; } // skip meta fields
        if (!(fieldName in allowedFields)) { // not already added?
          allowedFields[fieldName] = fields[group][fieldName];
          noneAllowed = false;
        }
      }
      // extract required fields
      var grf = fields[group]['$' + req.method.toLowerCase() + 'Requires'];
      if (grf) {
        for (var j=0, jj=grf.length; j < jj; j++) { 
          requiredFields[grf[j]] = true;
        }
      }
    }
    if (noneAllowed) return utils.sendError(res, errors.auth.DATA_PERMISSIONS);

    // filter request body based on allowed fields
    var data = {};
    for (var fieldName in req.body) {
      if (!allowedFields.hasOwnProperty(fieldName)) continue;
      data[fieldName] = req.body[fieldName];
    }

    // now check requireds
    var requireErrors = {}, hasRequireErrors = false;
    for (var field in requiredFields) {
      if (!(field in data)) {
        requireErrors[field] = { field:field, mesage: 'Required', validator:'required' };
        hasRequireErrors = true;
      }
    }
    if (hasRequireErrors) return utils.sendError(res, errors.input.VALIDATION_FAILED, requireErrors);

    // attach field-data to the request
    req.fields = allowedFields;
    req.body   = data;
    next();
  };
};