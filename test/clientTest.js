var Puppet =require('./../index').Puppet;
var doll=new Puppet({address:'ws://localhost:5445',secret:'masterofpuppets'});
doll.connect();