var tu = require('../lib/test-utils');

module.exports = function(cb) {
  tu.loginAsAdmin(function(err) {
    if (err) return cb(err);

    tu.populate('groups', [
      { name:'sales' },
      { name:'consumer' },
      { name:'manager' },
      { name:'cashier' },
      { name:'tapin-station' }
    ], function(err, groupIds) {
      var groups = {
        sales: groupIds[0],
        consumer: groupIds[1],
        manager: groupIds[2],
        cashier: groupIds[3],
        tapinStation: groupIds[4]
      };

      tu.populate('user', [
        { email:'sales@goodybag.com', password:'password', groups:[groups.sales] },
        { email:'client@goodybag.com', password:'password', groups:[groups.consumer] }
      ], function(err, userIds) {

        tu.populate('consumer', [
          { email:'tferguson@gmail.com', password:'password', firstName:'Turd', lastName:'Ferguson', screenName:'tferguson', cardId:'123456-ABC' }
        ], function(err, consumerIds) {

          tu.logout(cb);
        });
      });
    });
  });
};