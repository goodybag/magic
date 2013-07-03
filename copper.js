var copper = require('./db/copper');

copper.requests.insert({
  uuid: 'a'
, createdAt: 'now()'
, userId: 1
, httpMethod: 'GET'
, url: 'http://falkdsjflkasd.com'
, application: 'poop'
, userAgent: 'lolBrowser'
}, { returning: false }, function(error, result){
  if (error) return console.log(error);

  copper.requests.find({}, function(e,r){ console.log(e,r); });
})