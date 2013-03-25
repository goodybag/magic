
var host = 'magic.goodybag.com';
var port = 80;

var prodGroups = require('./newProducts2.js');

var tu = require('./lib/test-utils');
var nGroups = prodGroups.length;
var currentGroup = 0;
function addNextProdGroup() {
  var prodGroup = prodGroups.pop();
  if (!prodGroup) return console.error('Done');
  console.error(Math.round((currentGroup++) / nGroups * 100)+'%');

  getBiz(prodGroup.businessName, function(err, payload, res) {
    if (err) { console.error(prodGroup.businessName, err); }
    else if (res.statusCode != 200) { console.error(prodGroup.businessName, res.statusCode, payload); }
    else {
      var biz = JSON.parse(payload).data[0];

      var addNextProd = function() {
        var prod = prodGroup.products.pop();
        if (!prod)
          return addNextProdGroup();

        addBizProd(biz.id, { name:prod.name, description:prod.description, price:prod.price, photoUrl:prod.photoUrl }, function(err, payload, res) {
          if (err) { console.error(prodGroup.businessName, prod, err); }
          else if (res.statusCode != 200) { console.error(prodGroup.businessName, res.statusCode, payload); }
          addNextProd();
        });
      };
      addNextProd();
    }
  });
}
tu.loginAsAdmin(addNextProdGroup);

function getBiz(name, cb) {
  tu.httpRequest({
    method: 'get',
    hostname: host,
    path: '/v1/businesses/?limit=1&filter='+encodeURIComponent(name),
    port: port,
    headers: { accept:'application/json'}
  }, null, cb);
}
function addBizProd(id, prod, cb) {
  tu.httpRequest({
    method: 'post',
    hostname: host,
    path: '/v1/businesses/'+id+'/products',
    port: port,
    headers: { accept:'application/json', 'content-type':'application/json' }
  }, JSON.stringify(prod), cb);
}