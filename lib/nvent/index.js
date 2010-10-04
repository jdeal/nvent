var server = require("nvent/server").server;
var child_process = require('child_process');
var netBinding = process.binding('net');
var net = require('net');
var path = require("path");
var core = require('nvent/core');
var argv = require('optimist').argv;
var fd = null;
var currentPort = 8000;

// by default, can't edit anything
exports.baseEditPath = null;

function init(next){
    console.log("initializing...");
    if (!core.isUndefined(argv.edit)){
        var editPath = "" + argv.edit;
        if (!editPath.startsWith("/")){
            editPath = path.join(__dirname,'../..',editPath);
        }
        path.exists(editPath,function(exists){
            if (exists){
                exports.baseEditPath = editPath;
                console.log("baseEditPath = " + exports.baseEditPath);
            }
            next();
        });
    } else {
        next(); 
    }
}

var start = exports.start = function(port){

    init(function(){
        if (!core.isUndefined(port) && parseInt(port,10)>0){
            currentPort = parseInt(port,10); 
        }
        console.log("nvent starting on port " + currentPort + "...");
        var afNum = 4;
        fd = netBinding.socket('tcp' + afNum);
        netBinding.bind(fd, currentPort, null);
        netBinding.listen(fd, 128);
        //var fds = netBinding.socketpair();
        
        console.log("nvent started");
        server.listenFD(fd);
    });
};

var startChild = exports.startChild = function(){

    init(function(){
        console.log("nvent child starting...");
        var stdin = new net.Stream(0, 'unix');
        stdin.addListener('data', function(json){
            process.sparkEnv = env = JSON.parse(json.toString());
        });
        stdin.addListener('fd', function(childFd){
            fd = childFd;
            server.listenFD(fd);
            console.log("nvent child started");
        });
        stdin.resume();
    });
};

var restart = exports.restart = function(){
    
    console.log("nvent restarting...");
    var fds = netBinding.socketpair();

    // Spawn the child process
    var child = child_process.spawn(
        process.argv[0],
        //[path.join(__dirname,"../../bin/nvent"), ['--child','--edit='+exports.baseEditPath]],
        [path.join(__dirname,"../../bin/nvent"), '--child','--edit='+exports.baseEditPath], 
        undefined,
        [fds[1], 1, 2]
    );
    
    if (!child.stdin) {
        child.stdin = new net.Stream(fds[0], 'unix');
    }

    //child.stdin.write(JSON.stringify(env), 'ascii', fd);
    child.stdin.write(JSON.stringify({}), 'ascii', fd);
    
    process.exit();
};
