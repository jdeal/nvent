var express = require("express");
var path = require("path");

var app = exports.server = express.createServer();

app.configure(function(){
	app.use(express.staticProvider(path.join(__dirname,'../../resources/@public')));
});