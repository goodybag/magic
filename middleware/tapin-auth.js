module.exports = function(req, res, next){
  if (!req.header('tapin-auth')) return next();

  if (!req.session || !req.session.user) return next();
console.log(req.session.user);
  // only certain groups can respond to this request type
  if (req.session.user.groups.indexOf('tapin-station') === -1) return next();
  var
    // Keep track of the current user
    currentUser = req.session.user
    // We're going to override this function - keep track of what it was
  , currentEnd = res.end
  ;

  // Override the res.end function so we can restore the
  // user in session after the request has been performed
  res.end = function(){
    req.session.user = currentUser;
    currentEnd.apply(res, arguments);
  };
next();
  // Look up the user based on cardId and set them to session
  // lookUpUser(req.body.cardId, function(error, user){
  //   if (error) return res.send(error);

  //   req.session.user = user;

  //   return next()
  // });
};