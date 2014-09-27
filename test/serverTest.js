var Master=require('./../index').Master;

/*
 new server({secret:'masterofpuppets',port: 5445, notifier: new smsGateway({
 host     : '178.63.71.132',
 user     : 'rotunnel_sms',
 password : 'BaldedMoveGlumlySome31',
 database: 'rotunnel_sms',
 insecureAuth: true,
 phoneNumbers:['+40799555043','+40766690934']
 })}).start();
 */

new Master({secret:'masterofpuppets',port: 5445}).start();