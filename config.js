var config = {
  dev: {
    postgresConnStr:  "postgres://localhost:5432/goodybag"
  , cookieSecret: "g00dybagr0cks!"
  , numWorkers: 4
  , repl: {
      prompt: "gb-api> "
    , port: 4337
    }
  , http: {
      port: 3000
    }
  , validationOptions: {
      singleError: false
    }
  , facebook: {
      id: "159340790837933"
    , openGraphUrl: "https://graph.facebook.com/"
    }

  , passwordSalt: "$G00DYBAGR0CK$!"
  , consumerPasswordSaltLength: 10
  }

, test: {
    postgresConnStr:  "postgres://localhost:5432/goodybag-test"
  , cookieSecret: "g00dybagr0cks!"
  , numWorkers: 4
  , repl: {
      prompt: "gb-api> "
    , port: 4337
    }
  , http: {
      port: 8986
    }
  , validationOptions: {
      singleError: false
    }
  , facebook: {
      id: "159340790837933"
    , openGraphUrl: "https://graph.facebook.com/"
    }

  , passwordSalt: "$G00DYBAGR0CK$!"
  , consumerPasswordSaltLength: 10 
  }

, production: {

  }
};

for (var key in config.dev){
  config.production[key] = config.dev;
}

module.exports = config[process.env.mode || 'dev'];