var elastic = require('./lib/elastic-search')

elastic.save('product', {
  id:   parseInt(Math.random() * 100000)
, name: "Stupi's Shirt"
}, function(e, r){ console.log("index:", e, JSON.stringify(r, true, '  ')); })

// elastic.search('product', {
//   query: {
//     match: {
//       businessname: {
//         query: "palumbos"
//       // , zero_terms_query: 'all'
//       }
//     }
//   }
// // , explain: true
// // , filter: {
// //     word_delimiter: {
// //       generate_word_parts: true
// //     }
//     // or: [
//     //   { term: { name: 'pizza' } }
//     // ]
//   // }
// }, function(e, r){ console.log("search:", e,JSON.stringify(r, true, '  ')); })