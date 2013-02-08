
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
  , outputActivePoolIds: false

  , emailEnabled: false
  , emailFromAddress: 'team@goodybag.com'

  , cookieSecret: "g00dybagr0ck$!"
  , passwordSalt: "$G00DYBAGR0CK$!"
  , consumerPasswordSaltLength: 10

  , facebook: {
      id: "159340790837933"
    , openGraphUrl: "https://graph.facebook.com/"
    }
  , amazon: {
      awsId: "AKIAJZTPY46ZWGWU5JRQ"
    , awsSecret: "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"
    }
  , singly: {
      clientId: "e8171ccd4a3b90f15bbb41088efccc06"
    , clientSecret: "73fa4013446e9985e9217455479d3c3c"
    , callbackUrl: "http://localhost:3000/v1/callback"
    , apiBaseUrl: "https://api.singly.com"

      // Should probably make the url a template and make a util
      // function that performs this logic
    , applyFacebookTokenUrl: function(token){
        return "https://api.singly.com/auth/facebook/apply"
        + "?client_id="     + config.defaults.singly.clientId
        + "&client_secret=" + config.defaults.singly.clientSecret
        + "&token="         + token
        ;
      }
    }
  }

, dev: {
    http: {
      port: 3000
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag"
  , baseUrl: 'http://localhost:3000'

  , outputActivePoolIds: false
  , emailEnabled: true
  }

, test: {
    logging: {
      enabled: false
    }
  , http: {
      port: 8986
    }
  , postgresConnStr:  process.env['PG_CON'] || "postgres://localhost:5432/goodybag-test"
  , baseUrl: "http://localhost:8986"
  , outputActivePoolIds: false

  , facebook: {
      id:     "159340790837933"
    , secret: "49d2a33ae28a51d7f85b5c3a69ed0eaa"

    , openGraphUrl: "https://graph.facebook.com/"

    , firstNames: [
        'Cyndi'
      , 'Bob'
      , 'Tom'
      , 'Brett'
      , 'Justin'
      , 'John'
      , 'Alice'
      , 'Mary'
      , 'Guy'
      , 'Chance'
      , 'Stefanie'
      , 'Brittany'
      , 'Rachel'
      , 'William'
      , 'Robert'
      , 'Lalit'
      ]

    , lastNames: [
        'Fleming'
      , 'Winslow'
      , 'Swicegood'
      , 'Fawcett'
      , 'Kapoor'
      , 'Panchal'
      , 'Patel'
      , 'Santha'
      , 'Johnson'
      , 'Hoover'
      , 'Vermillion'
      , 'Awesome'
      , 'McGee'
      , 'McDonald'
      , 'McMaster'
      , 'McHammer'
      ]

      // Should probably make the url a template and make a util
      // function that performs this logic
    , testUserUrl: function(token){
        return "https://graph.facebook.com/"
        + config.test.facebook.id
        + "/accounts/test-users?installed=true"
        + "&name="
        + config.test.facebook.firstNames[parseInt(Math.random() * config.test.facebook.firstNames.length)]
        + "%20"
        + config.test.facebook.lastNames[parseInt(Math.random() * config.test.facebook.lastNames.length)]
        + "&locale=en_US&permissions=read_stream&method=post&access_token="
        + token;
      }
    }
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
  , outputActivePoolIds: false
  , emailEnabled: true
  , repl: {
      enabled: false
    }
  }

, production: {

  }
};

config.test.facebook.accessTokenUrl = ''
+ 'https://graph.facebook.com/oauth/access_token?'
+ 'client_id='      + config.test.facebook.id
+ '&client_secret=' + config.test.facebook.secret
+ '&grant_type='    + 'client_credentials'
;


var GB_ENV = process.env['GB_ENV'] = process.env['GB_ENV'] || 'dev';
if (GB_ENV == null || !config.hasOwnProperty(GB_ENV)) GB_ENV = 'dev';

module.exports = _.extend(config.defaults, config[GB_ENV]);
console.log('Loading ' + GB_ENV + ' config');
