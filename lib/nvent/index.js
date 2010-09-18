var server = require("nvent/server").server;

var start = exports.start = function(){
	console.log("nvent started");
	server.listen(8000);
}
