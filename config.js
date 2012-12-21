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
  , singly: {
      clientId: "e8171ccd4a3b90f15bbb41088efccc06"
    , clientSecret: "73fa4013446e9985e9217455479d3c3c"
    , callbackUrl: "http://localhost:3000/v1/callback"
    , apiBaseUrl: "https://api.singly.com"
    }
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
  , baseUrl: "http://localhost:8986"
  , singly: {
      clientId: "e8171ccd4a3b90f15bbb41088efccc06"
    , clientSecret: "73fa4013446e9985e9217455479d3c3c"
    , callbackUrl: "http://localhost:8986/v1/callback"
    , apiBaseUrl: "https://api.singly.com"
    }
  }

, production: {

  }
};

for (var key in config.dev){
  config.production[key] = config.dev;
}

module.exports = config[process.env.mode || 'dev'];
console.log('Loading '+(process.env.mode || 'dev')+' config');