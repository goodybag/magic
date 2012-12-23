
/**
 * Module dependencies
 */

var
  os = require('os')
, _ = require('lodash')
;

var config = {
  defaults: {
    http: {
      port: 3000
    }
  , repl: {
      prompt: "gb-api> "
    , port: 4337
    }
  , numWorkers: os.cpus().length
  , cookieSecret: "g00dybagr0ck$!"
  , facebook: {
      id: "159340790837933"
    , openGraphUrl: "https://graph.facebook.com/"
    }
  , passwordSalt: "$G00DYBAGR0CK$!"
  , consumerPasswordSaltLength: 10
  , validationOptions: {
      singleError: false
    }
  }

, dev: {
    http: {
      port: 3000
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag"
  }

, test: {
    http: {
      port: 8986
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag-test"
  , baseUrl: "http://localhost:8986"
  }

, staging: {
    postgresConnStr: process.env['DATABASE_URL']
  }

, production: {

  }
};


var GB_ENV = process.env['GB_ENV'] = process.env['GB_ENV'] || 'dev';
if (GB_ENV == null || !config.hasOwnProperty(GB_ENV)) GB_ENV = 'dev';

module.exports = _.extend(config.defaults, config[GB_ENV]);
console.log('Loading ' + GB_ENV + ' config');
