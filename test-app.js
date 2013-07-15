var elastic = require('./lib/elastic-search')

// elastic.index('product', {
//   id:   parseInt(Math.random() * 100000)
// , name: 'Bobbaadf'
// }, function(e, r){ console.log("index:", e, JSON.stringify(r, true, '  ')); })

elastic.search('product', {
  query: {
    fuzzy: { businessname: { value: 'domino', min_similarity: 0.8 } }
  }
, filter: {
    or: [
      { term: { name: 'pizza' } }
    ]
  }
}, function(e, r){ console.log("search:", e,JSON.stringify(r, true, '  ')); })