var logger = require('winston');
var ws = new require('ws').Server;
var events = require('events');
var action = new events.EventEmitter();
var defaultNotifier= new require('./notifiers/default');


function Master(opts) {

  this.notifier = opts.notifier || new defaultNotifier();
  this.port = opts.port;
  this.secret = opts.secret;
  this.puppets = [];
}

Master.prototype.start = function () {
  var server = new ws({port: this.port});
  var self = this;

  logger.info('Master', 'server started on 5445');

  server.on('connection', function (client) {
    var clientData = {
      address: client._socket.remoteAddress,
      authenticated: false,
      alive: true,
      loadData:100
    };
    self.puppets.push(clientData);

    setTimeout(function () {
      if (clientData.authenticated == false) {
        client.close();
        self.notifier.notify('client failed to authenticate: ' + clientData.address);
      }
    }, 3000);

    setInterval(function(){
      self.notifier.notify(JSON.stringify(self.puppets));
    },3600000);

    self.notifier.notify('incoming connection: ' + clientData.address);

    client.on('close', function () {
      clientData.alive = false;
      self.notifier.notify('client disconnected: ' + clientData.address);
    });

    client.on('message', function (message) {
      if (!tryParseJSON(message)) {
        self.notifier.notify('client: ' + clientData.address + ' sent invalid data and it was disconnected');
        client.close();
      } else {
        var command = JSON.parse(message);
        action.emit(command.action, command.data);
      }
    });

    action.on('authenticate', function (data) {
      if (data != self.secret) {
        client.close();
        self.notifier.notify('client sent an invalid secret: ' + clientData.address);
      } else {
        clientData.authenticated = true;
        self.notifier.notify('client was authenticated: ' + clientData.address);
      }
    });
    action.on('loadInfo', function (data) {
      clientData.loadData=data[2];
      console.log('loadInfo:[' + clientData.address + '] ' + data[2]);
    });
  });


};

Master.prototype.getPuppet =function(){
  var bestPuppet=this.puppets[0];
  this.puppets.forEach(function(puppet){
    if(puppet.loadData<bestPuppet.loadData)
      bestPuppet=puppet
  });
  console.log(bestPuppet);
  return bestPuppet;
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