var WebSocket = require('ws');
var os = require('os');

function Puppet(opts) {
  this.opts = opts;
}

Puppet.prototype.connect = function () {
  var self = this;
  var master = new WebSocket(self.opts.address);

  master.on('close', function () {
    alive = false;
    console.log('master not alive!');
  });
  master.on('open', function () {
    master.send(JSON.stringify({
      action: 'authenticate',
      data: self.opts.secret
    }));
    setInterval(function () {
        master.send(JSON.stringify({
          action: 'loadInfo',
          data: os.loadavg()
        }))
    }, 5000);
  });
};

module.exports = Puppet;
