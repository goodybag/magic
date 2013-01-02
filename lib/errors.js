/**
 * Errors
 *
 * Please refer to https://github.com/goodybag/magic/wiki/Error-Convention for spec
 */

var errors = {};

/**
 * Authentication Errors
 */

errors.auth = {};

errors.auth.NOT_AUTHENTICATED = {
  type:     "auth"
, code:     0001
, name:     "NOT_AUTHENTICATED"
, message:  "You are not authenticated. Please Login."
};
errors["0001"] = errors.auth.NOT_AUTHENTICATED;

errors.auth.NOT_ALLOWED = {
  type:     "auth"
, code:     0002
, name:     "NOT_ALLOWED"
, message:  "You are not allowed to use this resource."
};
errors["0002"] = errors.auth.NOT_ALLOWED;

errors.auth.INVALID_EMAIL = {
  type:     "auth"
, code:     0003
, name:     "INVALID_EMAIL"
, message:  "Invalid Email. Please try again."
};
errors["0003"] = errors.auth.INVALID_EMAIL;

errors.auth.INVALID_PASSWORD = {
  type:     "auth"
, code:     0004
, name:     "INVALID_PASSWORD"
, message:  "Invalid Password. Please try again."
};
errors["0004"] = errors.auth.INVALID_PASSWORD;

errors.auth.FACEBOOK_EXPIRED_TOKEN = {
  type:     "auth"
, code:     0005
, name:     "FACEBOOK_EXPIRED_TOKEN"
, message:  "Token has expired. Please get a new one."
};
errors["0005"] = errors.auth.FACEBOOK_EXPIRED_TOKEN;

errors.auth.FACEBOOK_CONNECTION = {
  type:     "auth"
, code:     0006
, name:     "FACEBOOK_CONNECTION"
, message:  "There was an error connecting to facebook."
};
errors["0006"] = errors.auth.FACEBOOK_CONNECTION;

// :TODO: is this the right error name?
// this is the error that the fields middleware provides if no data is allowed for the given group
errors.auth.DATA_PERMISSIONS = {
  type:     "auth"
, code:     0007
, name:     "DATA_PERMISSIONS"
, message:  "You are not allowed access to the data in this resource."
};
errors["0007"] = errors.auth.FACEBOOK_CONNECTION;

errors.auth.SINGLY_CALLBACK = {
  type:     "auth"
  , code:     0008
  , name:     "SINGLY_CALLBACK"
  , message:  "There was an error authenticating to service"
};

/**
 * Registration Errors
 */

errors.registration = {};

errors.registration.EMAIL_TAKEN = {
  type:     "registration"
, code:     0101
, name:     "EMAIL_TAKEN"
, message:  "There was an error connecting to facebook."
};
errors["0101"] = errors.registration.EMAIL_TAKEN;

errors.registration.SCREENNAME_TAKEN = {
  type:     "registration"
, code:     0107
, name:     "SCREENNAME_TAKEN"
, message:  "There was an error connecting to facebook."
};
errors["0107"] = errors.registration.SCREENNAME_TAKEN;



/**
 * Argument Errors
 */
module.exports = errors;