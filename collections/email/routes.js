var utils = require('../../lib/utils');
module.exports = {
  send: function(req, res, next) {
    req.body.html = req.body.body;
    utils.sendMail(req.body);
    res.send(204);
  }
};
