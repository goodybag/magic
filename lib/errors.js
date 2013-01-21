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
, code:     "0001"
, httpCode: "401"
, name:     "NOT_AUTHENTICATED"
, message:  "You are not authenticated. Please Login."
};
errors["0001"] = errors.auth.NOT_AUTHENTICATED;

errors.auth.NOT_ALLOWED = {
  type:     "auth"
, code:     "0002"
, httpCode: "403"
, name:     "NOT_ALLOWED"
, message:  "You are not allowed to use this resource."
};
errors["0002"] = errors.auth.NOT_ALLOWED;

errors.auth.INVALID_EMAIL = {
  type:     "auth"
, code:     "0003"
, httpCode: "401"
, name:     "INVALID_EMAIL"
, message:  "Invalid Email. Please try again."
};
errors["0003"] = errors.auth.INVALID_EMAIL;

errors.auth.INVALID_PASSWORD = {
  type:     "auth"
, code:     "0004"
, httpCode: "401"
, name:     "INVALID_PASSWORD"
, message:  "Invalid Password. Please try again."
};
errors["0004"] = errors.auth.INVALID_PASSWORD;

errors.auth.FACEBOOK_EXPIRED_TOKEN = {
  type:     "auth"
, code:     "0005"
, httpCode: "401"
, name:     "FACEBOOK_EXPIRED_TOKEN"
, message:  "Token has expired. Please get a new one."
};
errors["0005"] = errors.auth.FACEBOOK_EXPIRED_TOKEN;

errors.auth.FACEBOOK_CONNECTION = {
  type:     "auth"
, code:     "0006"
, httpCode: "504"
, name:     "FACEBOOK_CONNECTION"
, message:  "There was an error connecting to facebook."
};
errors["0006"] = errors.auth.FACEBOOK_CONNECTION;

// :TODO: is this the right error name?
// this is the error that the fields middleware provides if no data is allowed for the given group
errors.auth.DATA_PERMISSIONS = {
  type:     "auth"
, code:     "0007"
, httpCode: "403"
, name:     "DATA_PERMISSIONS"
, message:  "You are not allowed access to the data in this resource."
};
errors["0007"] = errors.auth.FACEBOOK_CONNECTION;

errors.auth.SINGLY_CALLBACK = {
  type:     "auth"
, code:     "0008"
, httpCode: "504"
, name:     "SINGLY_CALLBACK"
, message:  "There was an error authenticating to service"
};
errors[errors.auth.SINGLY_CALLBACK.code] = errors.auth.SINGLY_CALLBACK;

errors.auth.SERVICE_REQUIRED = {
  type:     "auth"
, code:     "0009"
, httpCode: "400"
, name:     "SERVICE_REQUIRED"
, message:  "You must specify a service when authenticating via a 3rd-party"
};
errors[errors.auth.SERVICE_REQUIRED.code] = errors.auth.SERVICE_REQUIRED;

errors.auth.INVALID_SERVICE = {
  type:     "auth"
, code:     "0010"
, httpCode: "400"
, name:     "INVALID_SERVICE"
, message:  "We do not support authenticating through that service"
};
errors[errors.auth.INVALID_SERVICE.code] = errors.auth.INVALID_SERVICE;

errors.auth.INVALID_CODE = {
  type:     "auth"
, code:     "0011"
, httpCode: "400"
, name:     "INVALID_CODE"
, message:  "The oauth code provided is invalid"
};
errors[errors.auth.INVALID_CODE.code] = errors.auth.INVALID_CODE;

errors.auth.INVALID_URI = {
  type:     "auth"
, code:     "0012"
, httpCode: "400"
, name:     "INVALID_URI"
, message:  "The supplied redirect_uri is invalid"
};
errors[errors.auth.INVALID_URI.code] = errors.auth.INVALID_URI;

errors.auth.INVALID_GROUP = {
  type:     "auth"
, code:     "0013"
, httpCode: "400"
, name:     "INVALID_GROUP"
, message:  "The supplied group is not supported for 3rd-party authentication"
};
errors[errors.auth.INVALID_GROUP.code] = errors.auth.INVALID_GROUP;

errors.auth.INVALID_CARD_ID = {
  type:     "auth"
, code:     "0014"
, httpCode: "400"
, name:     "INVALID_CARD_ID"
, message:  "The cardId is not valid"
};
errors[errors.auth.INVALID_CARD_ID.code] = errors.auth.INVALID_CARD_ID;

/**
 * Registration Errors
 */

errors.registration = {};

errors.registration.EMAIL_TAKEN = {
  type:     "registration"
, code:     "0101"
, httpCode: "400"
, name:     "EMAIL_TAKEN"
, message:  "This email has already been registered."
};
errors["0101"] = errors.registration.EMAIL_TAKEN;

errors.registration.SCREENNAME_TAKEN = {
  type:     "registration"
, code:     "0107"
, httpCode: "400"
, name:     "SCREENNAME_TAKEN"
, message:  "This screenname has already been registered."
};
errors["0107"] = errors.registration.SCREENNAME_TAKEN;

errors.registration.EMAIL_REGISTERED = {
  type:     "registration"
, code:     "0102"
, httpCode: "400"
, name:     "EMAIL_REGISTERED"
, message:  "This email is already registered"
}
errors["0102"] = errors.registration.EMAIL_REGISTERED;

/**
 * Input Errors
 */

errors.input = {};

errors.input.VALIDATION_FAILED = {
  type: "input"
, code: "0201"
, httpCode: "400"
, name: "VALIDATION_FAILED"
, message: "One or more of the supplied values did not pass validation"
};
errors["0201"] = errors.input.VALIDATION_FAILED;

errors.input.INVALID_CATEGORY_IDS = {
  type: "input"
, code: "0202"
, httpCode: "400"
, name: "INVALID_CATEGORY_IDS"
, message: "One or more of the supplied category ids does not belong to this business"
};
errors[errors.input.INVALID_CATEGORY_IDS.code] = errors.input.INVALID_CATEGORY_IDS;

errors.input.ARGUMENT_TAKEN ={
  type:     "input"
, code:     "0203"
, httpCode: "400"
, name:     "ARGUMENT_TAKEN"
, message:  "There was error of invalid id type"
};
errors["0203"] = errors.input.ARGUMENT_TAKEN;
module.exports = errors;

errors.input.INVALID_TAGS = {
    type: "input"
  , code: "0204"
  , httpCode: "400"
  , name: "INVALID_TAGS"
  , message: "One or more of the supplied tags does not belong to this business or is invalid"
};
errors[errors.input.INVALID_TAGS.code] = errors.input.INVALID_TAGS;

errors.input.INVALID_GROUPS = {
    type: "input"
  , code: "0205"
  , httpCode: "400"
  , name: "INVALID_GROUPS"
  , message: "One or more of the supplied groups does not exist"
};
errors[errors.input.INVALID_GROUPS.code] = errors.input.INVALID_GROUPS;

errors.input.INVALID_USERS = {
    type: "input"
  , code: "0205"
  , httpCode: "400"
  , name: "INVALID_USERS"
  , message: "One or more of the supplied users does not exist"
};
errors[errors.input.INVALID_USERS.code] = errors.input.INVALID_USERS;

errors.input.NOT_FOUND = {
  type: "input"
, code: "0206"
, httpCode: "404"
, name: "NOT_FOUND"
, message: "Record not found"
};
errors[errors.input.NOT_FOUND.code] = errors.input.NOT_FOUND;

/**
 * Internal Errors
 */

errors.internal = {};

errors.internal.DB_FAILURE = {
    type: "internal"
  , code: "0301"
  , httpCode: "500"
  , name: "DB_FAILURE"
  , message: "A query error has occurred"
};
errors[errors.internal.DB_FAILURE.code] = errors.internal.DB_FAILURE;
