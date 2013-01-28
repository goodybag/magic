var
  utils = require('../lib/utils')
;

module.exports = function(allPerms){
  return function(req, res, next){
    var
      // Everyone starts off with world
      perms = utils.clone(allPerms.world)

      // Overriding - saving for later
    , json = res.json

      /**
       * Filters a document based on permissions
       * @param  {Array}  permissions The set of permissions to filter by
       * @param  {Object} doc         The document to be filtered
       */
    , filterDoc = function(permissions, doc){
        for (var key in doc){
          if (permissions.indexOf(key) === -1) delete doc[key];
        }
      }
    ;

    // Aggregate permissions
    if (req.session && req.session.user){
      var groups = req.session.user.groups.concat('default') || ['default'];

      // Go through each group on the user obj and merge permissions
      for (var i = groups.length - 1, group, groupPerm, typePerms; i >= 0; i--){
        group = groups[i];

        // Skip if the users group isn't defined in the permissions doc
        if (!(group in allPerms)) continue;

        groupPerm = allPerms[group];

        // All logged in users have default
        for (var type in groupPerm){
          typePerms = groupPerm[type];

          // Check to see if they already have max permissions for this type
          if (perms[type] === true) continue;

          // It's either an array or a boolean
          if (utils.isArray(typePerms)){
            // Add the field to current permissions if it doesn't exist already
            for (var ii = typePerms.length - 1; ii >= 0; ii--){
              if (perms[type].indexOf(typePerms[ii]) === -1)
                perms[type].push(typePerms[ii]);
            }

          // This user gets max permissions for this type of request
          } else if (typePerms === true){
            perms[type] = true;
          }
        }
      }
    }

    // Filter body
    if (req.method === "POST" || req.method === "PATCH")
      filterDoc(req.method === "POST" ? perms.create : perms.update, req.body);

    res.json = function(result){
      // If there's an error or they have access to all, don't filter
      if (result.error || perms.read === true) return json.apply(res, arguments);

      // Filter all docs
      if (utils.isArray(result.data)){
        for (var i = result.data.length - 1; i >= 0; i--){
          filterDoc(perms.read, result.data[i]);
        }
      }else{
        filterDoc(perms.read, result.data);
      }

      json.apply(res, arguments);

      res.json = json;
    };

    next();
  };
};