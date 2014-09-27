var logger = require('winston');

function Notify() {
}

Notify.prototype.notify = function (message) {
  logger.info('notify ', '✓ ' + ' : ' + message);
};
module.exports = Notify;