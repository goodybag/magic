/**
 * Businesses server
 */

var server      = require('express')();
var middleware  = require('../../middleware');
var permissions = require('./permissions');
var applyGroups = require('./apply-groups');
var desc        = require('./description.yaml');
var routes      = require('./routes');

// Businesses.list
server.get(
  '/v1/businesses'
, middleware.profile('GET /v1/businesses', ['include','limit'])
, middleware.profile('validate query')
, middleware.defaults.query({
    limit : 20
  })
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.listRequests
server.get(
  '/v1/businesses/requests'
, middleware.profile('GET /v1/businesses/requests')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('list business requests handler')
, routes.listRequests
);

// Businesses.addRequest
server.post(
  '/v1/businesses/requests'
, middleware.profile('POST /v1/businesses/requests')
, middleware.profile('validate body')
, middleware.validate2.body(desc.requests.methods.post.body)
, middleware.profile('add business requests handler')
, routes.addRequest
);

// Businesses.listContactRequests
server.get(
  '/v1/businesses/contact-requests'
, middleware.profile('GET /v1/businesses/contact-requests')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('list business contact requests handler')
, routes.listContactRequests
);

// Businesses.addContactRequest
server.post(
  '/v1/businesses/contact-requests'
, middleware.profile('POST /v1/businesses/contact-requests')
, middleware.profile('validate body')
, middleware.validate2.body(desc.contact.methods.post.body)
, middleware.profile('add business contact request handler')
, routes.addContactRequest
);

// Businesses.list
server.get(
  '/v1/businesses/food'
, middleware.profile('GET /v1/businesses/food', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['food']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/fashion'
, middleware.profile('GET /v1/businesses/fashion', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag   : ['apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.list
server.get(
  '/v1/businesses/other'
, middleware.profile('GET /v1/businesses/other', ['include','limit'])
, middleware.profile('query defaults')
, middleware.defaults.query({
    limit : 20
  })
, middleware.profile('validate query')
, middleware.validate2.query(desc.collection.methods.get.query)
, middleware.profile('query defaults')
, middleware.defaults.query({
    tag : ['!food,!apparel']
  })
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('list businesses handler')
, routes.list
);

// Businesses.get
server.get(
  '/v1/businesses/:id'
, middleware.profile('GET /v1/businesses/:id')
, middleware.profile('validate query')
, middleware.validate2.query(desc.item.methods.get.query)
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('get business handler')
, routes.get
);


// Businesses.loyalty.get
server.get(
  '/v1/businesses/:id/loyalty'
, middleware.profile('GET /v1/businesses/:id/loyalty')
, middleware.profile('get business loyalty handler')
, routes.getLoyalty
);

// Businesses.loyalty.patch
server.put(
  '/v1/businesses/:id/loyalty'
, middleware.profile('PUT /v1/businesses/:id/loyalty')
, middleware.profile('apply groups businesses ownerManager')
, middleware.applyGroups(applyGroups.ownerManager)
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'ownerManager')
, middleware.profile('permissions')
, middleware.permissions(permissions.loyalty)
, middleware.profile('validate body')
, middleware.validate2.body(desc.loyaltySettings.methods.put.body)
, middleware.profile('update business loyalty handler')
, routes.updateLoyalty
);

// Businesses.del
server.del(
  '/v1/businesses/:id'
, middleware.profile('DELETE /v1/businesses/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin')
, middleware.profile('delete business handler')
, routes.del
);

// Businesses.create
server.post(
  '/v1/businesses'
, middleware.profile('POST /v1/businesses')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales', 'consumer')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('validate body')
, middleware.validate2.body(desc.collection.methods.post.body)
, middleware.profile('create business handler')
, routes.create
);

// Businesses.update
server.put(
  '/v1/businesses/:id'
, middleware.profile('PUT /v1/businesses/:id')
, middleware.profile('auth allow')
, middleware.auth.allow('admin', 'sales')
, middleware.profile('permissions')
, middleware.permissions(permissions.business)
, middleware.profile('validate body')
, middleware.validate2.body(desc.item.methods.put.body)
, middleware.profile('update business handler')
, routes.update
);

module.exports = server;