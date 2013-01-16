
/**
 * Module dependencies
 */

var
  os = require('os')
, _ = require('lodash')
;

var config = {
  defaults: {
    logging: {
      enabled: true
    , transports: {
        console: false
      , fileRotate: true
      }
    }
  , http: {
      port: 3000
    }
  , repl: {
      enabled: true
    , prompt: "gb-api> "
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

  , singly: {
      clientId: "e8171ccd4a3b90f15bbb41088efccc06"
    , clientSecret: "73fa4013446e9985e9217455479d3c3c"
    , callbackUrl: "http://localhost:3000/v1/callback"
    , apiBaseUrl: "https://api.singly.com"
    }
  }

, dev: {
    http: {
      port: 3000
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag"
  , baseUrl: 'http://localhost'
  }

, test: {
    logging: {
      enabled: false
    }
  , http: {
      port: 8986
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag-test"
  , baseUrl: "http://localhost:8986"
  }

, staging: {
    logging: {
      enabled: true
    , transports: {
        console: true
      }
    }
  , http: {
      port: process.env['PORT'] || 5000
    }
  , baseUrl: 'http://merlin.staging.goodybag.com'
  , postgresConnStr: process.env['DATABASE_URL']
  , repl: {
      enabled: false
    }
  }

, production: {

  }
};


var GB_ENV = process.env['GB_ENV'] = process.env['GB_ENV'] || 'dev';
if (GB_ENV == null || !config.hasOwnProperty(GB_ENV)) GB_ENV = 'dev';

module.exports = _.extend(config.defaults, config[GB_ENV]);
console.log('Loading ' + GB_ENV + ' config');
