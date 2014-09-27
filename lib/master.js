var logger = require('winston');
var ws = new require('ws').Server;
var events = require('events');
var action = new events.EventEmitter();
var defaultNotifier= new require('./notifiers/default');


function Master(opts) {

  this.notifier = opts.notifier || new defaultNotifier();
  this.port = opts.port;
  this.secret = opts.secret;
}

Master.prototype.start = function () {
  var server = new ws({port: this.port});
  var that = this;

  logger.info('Master', 'server started on 5445');

  server.on('connection', function (client) {
    var clientData = {
      address: client._socket.remoteAddress,
      authenticated: false,
      alive: true
    };
    setTimeout(function () {
      if (clientData.authenticated == false) {
        client.close();
        that.notifier.notify('client failed to authenticate: ' + clientData.address);
      }
    }, 3000);

    setInterval(function () {
      if (clientData.alive)
        client.send('heartbeat');
    }, 3000);
    that.notifier.notify('incoming connection: ' + clientData.address);

    client.on('close', function () {
      clientData.alive = false;
      that.notifier.notify('client disconnected: ' + clientData.address);
    });

    client.on('message', function (message) {
      if (!tryParseJSON(message)) {
        that.notifier.notify('client: ' + clientData.address + ' sent invalid data and it was disconnected');
        client.close();
      } else {
        var command = JSON.parse(message);
        action.emit(command.action, command.data);
      }
    });

    action.on('authenticate', function (data) {
      if (data != that.secret) {
        client.close();
        that.notifier.notify('client sent an invalid secret: ' + clientData.address);
      } else {
        clientData.authenticated = true;
        that.notifier.notify('client was authenticated: ' + clientData.address);
      }
    });
    action.on('loadInfo', function (data) {
      console.log('loadInfo:[' + clientData.address + '] ' + data[2]);
    });
  });


};

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) {
  }

  return false;
};

module.exports = Master;