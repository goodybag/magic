var elastic = require('./lib/elastic-search')

// elastic.save('product', {
//   id:   parseInt(Math.random() * 100000)
// , name: "Stupi's Shirt"
// }, function(e, r){ console.log("index:", e, JSON.stringify(r, true, '  ')); })

elastic.search('product', {
  query: {
    multi_match: {
      query: "pizza"
    , fields: ['name', 'businessName']
    }
  }
// , explain: true
// , filter: {
//     or: [
//       { term: { name: 'pizza' } }
//     ]
//   }
}, function(e, r){ console.log("search:", e,JSON.stringify(r, true, '  ')); })