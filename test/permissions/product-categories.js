var security = require('../security');
var _ = require('lodash');

var tests = [{
  method: 'GET',
  path: '/v1/businesses/1/product-categories'
}];

var createCategory = function(user, statusCode) {
  var test = {
    method: 'POST',
    path: '/v1/businesses/1/product-categories',
    user: user,
    statusCode: statusCode || 204,
    body: {
      businessId: 1,
      order: 1,
      name: 'test',
      description: 'whatever'
    }
  }
  tests.push(test);
};

var updateCategory = function(user, statusCode) {
  var test = {
    method: 'PUT',
    path: '/v1/businesses/1/product-categories/1',
    user: user,
    statusCode: statusCode || 204,
    body: {
      businessId: 1,
      order: 1,
      name: 'test',
      description: 'whatever'
    }
  };
  var updateViaPost = _.cloneDeep(test);
  updateViaPost.method = 'POST';
  tests.push(test);
  tests.push(updateViaPost);
};

var deleteCategory = function(user, statusCode) {
  var test = {
    method: 'DELETE',
    path: '/v1/businesses/1/product-categories/1',
    user: user,
    statusCode: statusCode || 204
  }
  tests.push(test);
};

createCategory(undefined, 401);
createCategory('admin@goodybag.com');
createCategory('sales@goodybag.com');
createCategory('consumer@goodybag.com', 403);
createCategory('some_manager@gmail.com');
createCategory('some_manager2@gmail.com');
createCategory('manager_redeem3@gmail.com', 403);

updateCategory(undefined, 401);
updateCategory('admin@goodybag.com');
updateCategory('sales@goodybag.com');
updateCategory('consumer@goodybag.com', 403);
updateCategory('some_manager@gmail.com');
updateCategory('some_manager2@gmail.com');
updateCategory('manager_redeem3@gmail.com', 403);

deleteCategory(undefined, 401);
deleteCategory('admin@goodybag.com');
deleteCategory('sales@goodybag.com');
deleteCategory('consumer@goodybag.com', 403);
deleteCategory('some_manager@gmail.com');
deleteCategory('some_manager2@gmail.com');
deleteCategory('manager_redeem3@gmail.com', 403);


security(tests);
