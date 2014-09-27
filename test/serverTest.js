var Master=require('./../index').Master;
var masterOfPuppets =new Master({secret:'masterofpuppets',port: 5445});
masterOfPuppets.start();