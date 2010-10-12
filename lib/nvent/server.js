var express = require("express");
var path = require("path");
var fileUtil = require("nvent/util/file");
var fs = require("fs");
var core = require("nvent/core");
var argv = require("optimist").argv;
var nvent = require('nvent');
var error = require('nvent/error');
var app = exports.server = express.createServer();

var nventPath = path.join(__dirname,"../..");

app.error(function(err, req, res, next){
    res.send(core.error(err.name,err.message));
});

app.configure(function(){
    app.use(express.bodyDecoder());
    app.use(express.staticProvider(path.join(__dirname,'../../resources/@public')));
});

app.get("/_core/restart.json",function(req,res){
    // SECURITY!!!
    res.send(core.success());
    require("nvent").restart();
});

app.get("/_core/kill.json",function(req,res){
    // SECURITY!!!
    res.send(core.success());
    process.exit();
});

app.get("/_core/file.json",function(req,res){
    // SECURITY!!!
    if (nvent.baseEditPath === null){
        throw error.create("AccessDeniedError");
    }
    if (core.isBlank(req.param("path"))){
        throw error.create("PathRequiredError");
    }
    var filePath = path.join(nvent.baseEditPath,req.param("path"));
    path.exists(filePath,function(exists){
        if (exists){
            fileUtil.isFolder(filePath,function(isFolder){
                if (isFolder){
                    res.send(core.success({"type":"folder"}));
                } else {
                    fs.readFile(filePath,"binary",function(error,file){
                        if (file.length > 0){
                            res.send(core.success({"type":"file","content":file}));
                        } else {
                            res.send(core.success({"type":"file","content":""}));
                        }
                    });
                }
            });
        } else {
            throw error.create("FileNotFoundError");
        }
    });
});

// SECURITY!!!
function saveHandler(req,res){
    if (nvent.baseEditPath === null){
        throw error.create("AccessDeniedError");
    }
    if (core.isBlank(req.param("path"))){
        throw error.create("PathRequiredError");
    }
    var writePath = path.join(nvent.baseEditPath,req.param("path"));
    path.exists(writePath,function(exists){
        if (exists){
            fileUtil.isFolder(writePath,function(isFolder){
                if (isFolder){
                    res.send(core.success());
                } else {
                    console.log(writePath);
                    fs.writeFile(writePath,req.param("content"),function(err){
                        if (err){
                            throw error.create("FileWriteError");
                        } else {
                            res.send(core.success());
                        }
                    });
                }
            });   
        } else {
            if (typeof(req.param("content"))!=="undefined" && req.param("content")!==null){
                if (req.param("content")===""){
                    //node.js doesn't like writing blank files
                    fs.open(writePath,"w",parseInt("0666",8),function(err){
                        if (err){
                            throw error.create("FileWriteError");
                        } else {
                            res.send(core.success());
                        }
                    });
                } else {
                    fs.writeFile(writePath,req.param("content"),function(err){
                        if (err){
                            throw error.create("FileWriteError");
                        } else {
                            res.send(core.success());
                        }
                    });
                }
            } else {
                fs.mkdir(writePath,parseInt("0755",8),function(err){
                    if (err){
                        throw error.create("DirectoryWriteError");
                    } else {
                        res.send(core.success());
                    }
                });
            }
        }
    });
}

app.post("/_core/save.json",saveHandler);
app.get("/_core/save.json",saveHandler);

app.get("/_core/delete.json",function(req,res){
    if (nvent.baseEditPath === null){
        throw error.create("AccessDeniedError");
    }
    if (core.isBlank(req.param("path"))){
        throw error.create("PathRequiredError");
    }
    var deletePath = fileUtil.safePath(req.param("path"));
    deletePath = path.join(nvent.baseEditPath,deletePath);
    path.exists(deletePath,function(exists){
        if (exists){
            fileUtil.isFolder(deletePath,function(isFolder){
                if (isFolder){
                    fs.rmdir(deletePath,function(error){
                        if (error){
                            throw error.create("DirectoryDeleteError");
                        } else {
                            res.send(core.success());
                        }
                    });
                } else {
                    fs.unlink(deletePath,function(error){
                        if (error){
                            throw error.create("FileDeleteError");
                        } else {
                            res.send(core.success());
                        }
                    });
                }
            });
        } else {
            throw error.create("InvalidPathError");
        }
    });
});

app.get("/_core/files.json",function(req,res){
    // SECURITY!!!
    //console.log(nvent.baseEditPath);
    if (nvent.baseEditPath === null){
        throw error.create("AccessDeniedError");
    }
    var data = [];
    if (!core.isBlank(req.param("path"))){
        var serverPath = nvent.baseEditPath;
        var basePath = "/";
        serverPath = path.join(serverPath,req.param("path"));
        console.log("serverPath="+serverPath); 
        basePath = req.param("path");
        fileUtil.dir(serverPath,function(error,filesAndFolders){
            //filesAndFolders.sort();
            filesAndFolders.forEach(function(f){
                if (f.isFolder){
                    data.push({data:f.name,state:"closed",attr:{"path":path.join(basePath,f.name)}});
                } else {
                    data.push({data:f.name,attr:{"path":path.join(basePath,f.name)}});
                }
            });
            res.send(core.success(data));
        });
    } else {
        //console.log("root");
        data.push({data:"[root]",state:"closed",attr:{"path":"/"}});
        res.send(core.success(data));
    }
});
