
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
      , papertrail: true
      , loggly: true
      , gelf: true
      }
    }
  , http: {
      port: 3000
    }
  , pg: {
    poolSize: 5
  }
  , numWorkers: os.cpus().length
  , outputActivePoolIds: false

  , allCollectionPhotoUrl: 'http://cdn.filepicker.io/api/file/8jCqOI3JRKXckMfepkCX'

  , algorithms: {
      popular: {
        numLists: 20
      }
    }

  , emailEnabled: false
  , emailFromAddress: 'info@goodybag.com'

  , cookieSecret: "g00dybagr0ck$!"
  , passwordSalt: "$G00DYBAGR0CK$!"
  , consumerPasswordSaltLength: 10

  , amazon: {
      awsId: "AKIAJZTPY46ZWGWU5JRQ"
    , awsSecret: "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"
    }
  , pubnub: {
      publish_key: 'pub-c-2ae7884a-eb30-4466-9f8d-21e8ad2d4193',
      subscribe_key: 'sub-c-48c5140a-73c7-11e2-8b02-12313f022c90',
      secret_key: 'sec-c-M2JmZmY5MTUtNjkyZS00MGQ5LTgxYzMtMjhjNTJkYjk5NDVh'
    }
  , singly: {
      clientId: "f75b4f3c213b8539935ad88da572b726"
    , clientSecret: "c0376da804f99c01988dc7bff0b80f21"
    , callbackUrl: "http://goodybag.com/"
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
  , loggly: {
      subdomain:'goodybagpaul'
    , inputToken: '073b990f-2045-4f46-9290-84e9fc79ff61'
    , auth: {
        username: 'pfraze'
      , password: 'imlikeabeaverbuildingadam!'
      }
    }
  , papertrail: {
      host: 'logs.papertrailapp.com'
    , port: 24616
    }

  , gelf: {
      host: 'logs.goodybag.com'
    , port: 12201
    , app: 'magic'
  }

  , facebook: {
      id: "159340790837933"
    , secret: "49d2a33ae28a51d7f85b5c3a69ed0eaa"
    , openGraphUrl: "https://graph.facebook.com/"
    }
  }

, dev: {
    http: {
      port: 3000
    }

  , logging: {
      enabled: true
    , transports: {
        devConsole: true
      , gelf: true
      }
    }
  , gelf: {
      host: 'logs.goodybag.com'
    , port: 12201
    , app: 'magic-dev'
    }
  , copper: {
      connStr: 'postgres://localhost:5432/goodybag-copper'
    }
  , postgresConnStr:  "postgres://localhost:5432/goodybag"
  , baseUrl: 'http://localhost:3000'

  , emailEnabled: false
  }

, test: {
    logging: {
       enabled: true,
       transports: {
         gelf: true
       }
    }
  , gelf: {
      host: 'localhost'
    , port: 12201
    , app: 'magic-dev'
  }
  , http: {
      port: 8986
    }
  , pg: {
    hideDeprecationWarnings: false
  , poolSize: 15
  }
  //send packets to localhost so they don't
  //all go to the production log server & needlessly
  //fill it with waste data
  , gelf: {
      host: '127.0.0.1'
    , port: 12201
    , app: 'magic-test'
  }
  , copper: {
      connStr: 'postgres://localhost:5432/goodybag-test-copper'
    }
  , postgresConnStr:  process.env['PG_CON'] || "postgres://localhost:5432/goodybag-test"
  , baseUrl: "http://localhost:8986"

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
      , gelf: true
      , loggly: true
      }
    }
  , http: {
      port: process.env['PORT'] || 5000
    }

  , baseUrl: 'http://magic.staging.goodybag.com'
  , copper: {
      connStr: process.env.HEROKU_POSTGRESQL_COPPER_URL
    }
  , postgresConnStr: process.env['DATABASE_URL']
  , emailEnabled: true
  , gelf: {
      host: 'logs.goodybag.com'
    , port: 12201
    , app: 'magic-staging'
    }

  , facebook: {
      id: "159340790837933"
    , secret: "49d2a33ae28a51d7f85b5c3a69ed0eaa"
    , openGraphUrl: "https://graph.facebook.com/"
    }

  , singly: {
      clientId: "61c5aa33341cc78f4baf5e140374aed1"
    , clientSecret: "f75b4f3c213b8539935ad88da572b726"
    , callbackUrl: "http://goodybag.com/"
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

, production: {
    logging: {
      enabled: true
    , transports: {
        console: true
      , gelf: true
      }
    }
  , pg: {
    poolSize: 20
  }
  , http: { port: process.env['PORT'] || 5000 }
  , baseUrl: 'http://magic.goodybag.com'
  , copper: {
      connStr: process.env.HEROKU_POSTGRESQL_COPPER_URL
    }
  , postgresConnStr: process.env['DATABASE_URL']
  , emailEnabled: true

  , facebook: {
      id: "152282721508707"
    , secret: "dab936ceb6f17e79c3be136595d69144"
    , openGraphUrl: "https://graph.facebook.com/"
    }

  , singly: {
      clientId: "60273b907ac74303b2d1bdc135f8d6e3"
    , clientSecret: "c0376da804f99c01988dc7bff0b80f21"
    , callbackUrl: "http://goodybag.com/"
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
