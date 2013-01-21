process.env['GB_ENV'] = 'test';

var
  fs = require('fs')

, utils = require('../lib/test-utils')
, config = {
    usersToCreate: 10
  , destination: './fb-test-users.js'
  }

, users = []

, createUsers = function(){
    utils.createTestOauthUser(function(error, results){
      if (error) return console.log(error), createUsers();

      console.log("created User!");
      console.log(results);

      if (users.push(results) < config.usersToCreate) return createUsers();

      return writeUsers()
    });
  }

, writeUsers = function(){
    var file = "module.exports = " + JSON.stringify(users) + ";";
    fs.writeFile(config.destination, file, function(error){
      if (error) console.log(error), process.exit(1);
      process.exit(0);
    });
  }
;

createUsers();