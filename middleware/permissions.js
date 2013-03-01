var
  fs = require('fs')
, utils = require('../lib/utils')
, collections = {}
, files = fs.readdirSync(__dirname + '/../collections/')

, getExpandedPerms = function(group, type, perms){
    if (typeof perms === "boolean") return perms;

    // Copy so we don't change the original object
    perms = perms.slice(0);
    // Go through each permission to see if we have something to expand
    for (var i = 0, collection; i < perms.length; i++){
      if (perms[i].indexOf(':') === -1) continue;

      // The ol' switcheroo
      collection  = perms[i].substring(perms[i].lastIndexOf(':') + 1);
      perms[i]    = perms[i].substring(0, perms[i].lastIndexOf(':'));

      // add on the expanded set of permissions
      perms = perms.concat(
        getExpandedPerms(group, type, collections[collection][group][type]).map(function(perm){
          return perms[i] + "." + perm;
        })
      );
    }

    return perms;
  }
;

// Get all of the permissions files
for (var i = files.length - 1, dir; i >= 0; i--){
  if (!fs.statSync(dir = __dirname + '/../collections/' + files[i]).isDirectory())
    continue;

  if (!fs.existsSync(dir + '/permissions.js')) continue;

  collections[files[i]] = require(dir + '/permissions');
}

// Expand references
var perms;
  // Each collection
for (var collection in collections){
  // Dealing with sub-collections
  if (!('world' in collections[collection])){
    // Loop through each sub-collection
    for (var subCollection in collections[collection]){
      // Each group in the sub-collections
      for (var group in collections[collection][subCollection]){
        // Each type of request
        for (var requestType in collections[collection][subCollection][group]){
          if (!utils.isArray(collections[collection][subCollection][group][requestType])) continue;

          perms = collections[collection][subCollection][group][requestType];
          collections[collection][subCollection][group][requestType] = getExpandedPerms(group, requestType, perms);
        }
      }
    }
  } else {
    // Each group in the collections
    for (var group in collections[collection]){
      // Each type of request
      for (var requestType in collections[collection][group]){
        if (!utils.isArray(collections[collection][group][requestType])) continue;

        perms = collections[collection][group][requestType];

        collections[collection][group][requestType] = getExpandedPerms(group, requestType, perms);
      }
    }
  }
}

module.exports = function(allPerms){
  return function(req, res, next){
    var
      // Everyone starts off with world
      perms = {
        read:   typeof allPerms.world.read   !== "boolean" ? allPerms.world.read.slice(0)   : allPerms.world.read
      , create: typeof allPerms.world.create !== "boolean" ? allPerms.world.create.slice(0) : allPerms.world.create
      , update: typeof allPerms.world.update !== "boolean" ? allPerms.world.update.slice(0) : world.update
      }

      // Overriding - saving for later
    , json = res.json

    , filtered = []

      /**
       * Filters a document based on permissions
       * @param  {Array}  permissions The set of permissions to filter by
       * @param  {Object} doc         The document to be filtered
       */
    , filterDoc = function(permissions, doc, subKeyPrepend){
        if (typeof doc !== "object") return;

        subKeyPrepend = subKeyPrepend || "";
        for (var key in doc){
          if (permissions.indexOf(subKeyPrepend + key) === -1){
            filtered.push(key);
            delete doc[key];
            continue;
          }

          if (utils.isArray(doc[key])){
            for (var i = doc[key].length - 1; i >= 0; i--){
              filterDoc(permissions, doc[key][i], subKeyPrepend + key + ".");
            }
          }
        }
      }
    ;

    var groups = [];
    if (req.session && req.session.user)
      groups = groups.concat(req.session.user.groups).concat('default');
    if (req.permittedGroups)
      groups = groups.concat(req.permittedGroups);

    // Aggregate permissions
    if (groups.length > 0){
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
    if (req.body){
      var filters;

      if (req.method === "POST") filters = perms.create;
      if (req.method === "PATCH" || req.method === "PUT") filters = perms.update;

      if (typeof filters !== "boolean")
        filterDoc(filters, req.body);
    }

    res.json = function(result){
      // If there's an error or they have access to all, don't filter
      if (result.error || perms.read === true) return json.apply(res, arguments);

      // Filter all docs
      var wasEmpty;
      if (utils.isArray(result.data)){
        wasEmpty = utils.isEmpty(result.data[0]);
        for (var i = result.data.length - 1; i >= 0; i--){
          filterDoc(perms.read, result.data[i]);
        }
        if (!wasEmpty && utils.isEmpty(result.data[0]))
          return res.error(errors.auth.DATA_PERMISSIONS);
      } else {
        wasEmpty = utils.isEmpty(result.data);
        filterDoc(perms.read, result.data);
        if (!wasEmpty && utils.isEmpty(result.data))
          return res.error(errors.auth.DATA_PERMISSIONS);
      }

      json.apply(res, arguments);

      res.json = json;
    };

    if (filtered.length > 0){
      return res.error(errors.auth.INVALID_WRITE_PERMISSIONS, filtered);
    }
    next();
  };
};