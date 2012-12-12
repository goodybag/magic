/*
  Errors
*/

var
  // App Dependencies
  utils = require('./utils')

  // Module Variables

, errors = {}
;

// Auth errors
errors.authentication   = utils.error("You are not authenticated. Please Login.", "authentication");
errors.invalidEmail     = utils.error("Invalid Email. Please try again.",         "authentication");
errors.invalidPassword  = utils.error("Invalid Password. Please try again.",      "authentication");

// Facebook
errors.expiredToken     = utils.error("Token has expired. Please get a new one.", "facebook");
errors.fbConnection     = utils.error("There was an error connecting to facebook.", "facebook");


// Registration errors
errors.emailTaken       = utils.error("This email address has already been registered.",  "registration");
errors.screenNameTaken  = utils.error("This screen name has already been registered.",    "registration");

module.exports = errors;