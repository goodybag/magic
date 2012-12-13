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

errors.auth.INVALID_EMAIL = {
  type:     "auth"
, code:     0002
, name:     "INVALID_EMAIL"
, message:  "Invalid Email. Please try again."
};
errors["0002"] = errors.auth.INVALID_EMAIL;

errors.auth.INVALID_PASSWORD = {
  type:     "auth"
, code:     0003
, name:     "INVALID_PASSWORD"
, message:  "Invalid Password. Please try again."
};
errors["0003"] = errors.auth.INVALID_PASSWORD;

errors.auth.FACEBOOK_EXPIRED_TOKEN = {
  type:     "auth"
, code:     0004
, name:     "FACEBOOK_EXPIRED_TOKEN"
, message:  "Token has expired. Please get a new one."
};
errors["0004"] = errors.auth.FACEBOOK_EXPIRED_TOKEN;

errors.auth.FACEBOOK_CONNECTION = {
  type:     "auth"
, code:     0005
, name:     "FACEBOOK_CONNECTION"
, message:  "There was an error connecting to facebook."
};
errors["0005"] = errors.auth.FACEBOOK_CONNECTION;

/**
 * Registration Errors
 */

errors.registration = {};

errors.registration.EMAIL_TAKEN = {
  type:     "registration"
, code:     0006
, name:     "EMAIL_TAKEN"
, message:  "There was an error connecting to facebook."
};
errors["0006"] = errors.registration.EMAIL_TAKEN;

errors.registration.SCREENNAME_TAKEN = {
  type:     "registration"
, code:     0007
, name:     "SCREENNAME_TAKEN"
, message:  "There was an error connecting to facebook."
};
errors["0007"] = errors.registration.SCREENNAME_TAKEN;

module.exports = errors;