/**
 * Debug
 */

var Profiler = require('clouseau');

module.exports.getProfilerData = function(req, res){
  var data = Profiler.getFormattedData();
  res.format({
    'application/json':function() {
      res.json(data);
    },
    'text/html':function() {
      var netTotalAvg = (data.tree.children || []).reduce(function(acc, node) { return acc + node.totalAverage }, 0);
      var routes = data.totals.filter(routesFilter);
      var functions = data.totals.filter(functionsFilter);
      if (req.query.sort == '-avg') {
        routes.sort(function(a, b) {
          return a.totalAverage < b.totalAverage ? 1 : -1;
        });
        functions.sort(function(a, b) {
          return a.localAverage < b.localAverage ? 1 : -1;
        });
      } else if (req.query.sort == 'avg') {
        routes.sort(function(a, b) {
          return a.totalAverage > b.totalAverage ? 1 : -1;
        });
        functions.sort(function(a, b) {
          return a.localAverage > b.localAverage ? 1 : -1;
        });
      }

      res.end([
        '<h1>Route Totals</h1>',
        '<table>',
          '<tr><th>Name</th><th>Elapsed</th><th>Calls</th><th>% of All</th><th>Avg</th><th>% of Avg</th></tr>',
          routes.map(function(total) {
            return [
              '<tr>',
                '<td>', total.name, '</td>',
                '<td>', total.totalElapsedf, '</td>',
                '<td>', total.count, '</td>',
                '<td>', Math.round(total.totalPercent.ofAll), '%</td>',
                '<td>', total.totalAveragef, '</td>',
                '<td>', Math.round(100 * total.totalAverage / netTotalAvg), '%</td>',
              '</tr>'
            ].join('');
          }).join(''),
        '</table>',
        '<h1>Function Totals</h1>',
        '<table>',
          '<tr><th>Name</th><th>Elapsed</th><th>Calls</th><th>% of All</th><th>Avg</th><th>% of Avg</th></tr>',
          functions.map(function(total) {
            return [
              '<tr>',
                '<td>', total.name, '</td>',
                '<td>', total.localElapsedf, '</td>',
                '<td>', total.count, '</td>',
                '<td>', Math.round(total.localPercent.ofAll), '%</td>',
                '<td>', total.localAveragef, '</td>',
                '<td>', Math.round(100 * total.localAverage / netTotalAvg), '%</td>',
              '</tr>'
            ].join('');
          }).join(''),
        '</table>',
        '<br/><hr/><br/>',
        '<form action="/v1/debug/profile" method="post">',
          '<input type="checkbox" name="enabled" value="1"', Profiler.enabled ? 'checked' : '',' /> Profiling Enabled<br/>',
          '<input type="checkbox" name="catchAll" value="1"', Profiler.catchAll ? 'checked' : '',' /> Profile All Requests<br/>',
          '<input type="submit" /> <a href="/v1/debug/profile">Refresh</a>',
        '</form>'
      ].join(''));
    }
  })
};

module.exports.updateProfilerSettings = function(req, res) {
  Profiler.enabled = req.body.enabled;
  Profiler.catchAll = req.body.catchAll;
  res.redirect('/v1/debug/profile');
}

function routesFilter(total) {
  return /^(GET|POST|PUT|PATCH|DELETE)/.test(total.name) == true;
}
function functionsFilter(total) {
  return /^(GET|POST|PUT|PATCH|DELETE)/.test(total.name) == false;
}