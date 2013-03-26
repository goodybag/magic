function run(node, opsMap) {
  if (doc) {
    if (Array.isArray(node)) {
      for (var i=0, ii=node.length; i < ii; i++)
        run(node[i], opsMap);
    } else if (typeof node == 'object' && node.__op) {
      var op = opsMap[node.__op];
      if (!op)
        console.error('Operation '+node.__op+' not found');
      else
        op(node);
      for (var k in node)
        run(node[k], opsMap);
    }
  }
}
module.exports.run = run;