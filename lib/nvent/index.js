var server = require("nvent/server").server;
var child_process = require('child_process');
var netBinding = process.binding('net');
var net = require('net');

var fd = null;

var start = exports.start = function(){
    
    console.log("nvent starting...");
    var afNum = 4;
    fd = netBinding.socket('tcp' + afNum);
    netBinding.bind(fd, 8000, null);
    netBinding.listen(fd, 128);
    //var fds = netBinding.socketpair();
    
    console.log("nvent started");
    //server.listen(8000);
    server.listenFD(fd);
}

var startChild = exports.startChild = function(){

    console.log("nvent child starting...");
    var stdin = new net.Stream(0, 'unix');
    stdin.addListener('data', function(json){
        process.sparkEnv = env = JSON.parse(json.toString());
    });
    stdin.addListener('fd', function(childFd){
        fd = childFd
        server.listenFD(fd);
        console.log("nvent child started");
    });
    stdin.resume();   
}

var restart = exports.restart = function(){
    
    console.log("nvent restarting...");
    var fds = netBinding.socketpair();

    // Spawn the child process
    var child = child_process.spawn(
        process.argv[0],
        ["nvent", '--child'],
        undefined,
        [fds[1], 1, 2]
    );
    
    if (!child.stdin) {
        child.stdin = new net.Stream(fds[0], 'unix');
    }

    //child.stdin.write(JSON.stringify(env), 'ascii', fd);
    child.stdin.write(JSON.stringify({port:8000}), 'ascii', fd);
    
    process.exit();
}
