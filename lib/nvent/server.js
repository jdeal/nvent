var express = require("express");
var path = require("path");

var app = exports.server = express.createServer();

app.configure(function(){
	app.use(express.staticProvider(path.join(__dirname,'../../resources/@public')));
});

var fakeData = [
	{ "data" : "A node", "children" : [ { "data" : "Only child", "state" : "closed" } ], "state" : "open" },
	"Ajax node"
];

app.get("/_core/resource.json",function(req,res){
	res.send(fakeData);
})