var mysql = require('mysql');
var logger = require('winston');

function SMS(opts) {
  this.opts = opts;
  this.connection = mysql.createConnection(opts);
  this.connection.connect(function (err) {
    if (err) {
      logger.error('error connecting: ' + err.stack);
      return;
    }
    logger.info('smsGateway', 'connected');
  });
}

SMS.prototype.notify = function (message) {
  var that = this;
  this.opts.phoneNumbers.forEach(function (phoneNumber) {
    var post = {DestinationNumber: phoneNumber, TextDecoded: message};
    that.connection.query('INSERT INTO outbox SET ?', post, function (err, result) {
      if (err)
        logger.info('notify ', '✗ failed to send the sms', err);
      if (result)
        logger.info('notify ', '✓ ' + phoneNumber + ' : ' + message);
    });
  });


};


module.exports = SMS;