var config = require('./config');
var Elastic = require('./lib/elastic-client');
var elastic = new Elastic({
  host:   config.elasticsearch.host
, index:  config.elasticsearch.index
});

// elastic.index('product', {
//   id:   parseInt(Math.random() * 100000)
// , name: 'Bobbaadf'
// }, function(e, r){ console.log("index:", e, JSON.stringify(r, true, '  ')); })

elastic.search('product', {
  query: {
    fuzzy: { name: { value: 'Bobbaadf', min_similarity: 0.00001, boost: 1 } }
  }
}, function(e, r){ console.log("search:", e,JSON.stringify(r, true, '  ')); })