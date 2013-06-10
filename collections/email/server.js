var server = require('express')();
var middleware = require('../../middleware');
var routes = require('./routes');
var desc = require('./description')

server.post(
  '/v1/email'
,  middleware.auth.allow('admin','manager')
,  middleware.validate2.body(desc.item.methods.post.body)
,  routes.send
);

module.exports = server;
