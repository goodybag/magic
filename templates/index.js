var fs = require('fs');

function makeTemplateFunc(html) {
  return function(obj) {
    var compiledHtml = html;
    for (var k in obj) {
      compiledHtml = compiledHtml.replace(RegExp('{{'+k+'}}','g'), obj[k]);
    }
    return compiledHtml;
  };
}

function loadTemplates(dirPath) {
  var funcs = {};
  var files = fs.readdirSync(dirPath);
  for (var i = files.length - 1; i >= 0; i--) {
    var name = files[i];
    if (name.slice(-5) == '.html') {
      var html = fs.readFileSync(dirPath + '/' + name, 'utf8');
      funcs[name.slice(0,-5).replace(/\-/g, '_')] = makeTemplateFunc(html);
    }
  }
  return funcs;
}

module.exports = {
  email: loadTemplates('./templates/email')
};