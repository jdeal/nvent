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
    res.send({success:false,error:err.name,error_message:err.message});
});

app.configure(function(){
    app.use(express.bodyDecoder());
    app.use(express.staticProvider(path.join(__dirname,'../../resources/@public')));
});

app.get("/_core/restart.json",function(req,res){
    res.send({success:true});
    require("nvent").restart();
    //res.send({success:true});
    //app.close();
    //process.exit();
});

app.get("/_core/kill.json",function(req,res){
    res.send({success:true});
    process.exit();
});

app.get("/_core/file.json",function(req,res){
    // SECURITY!!!
    if (typeof(req.param("path"))!=="undefined"){
        var filePath = path.join(__dirname,"../..",req.param("path"));
        path.exists(filePath,function(exists){
            if (exists){
                fileUtil.isFolder(filePath,function(isFolder){
                    if (isFolder){
                        res.send({success:true,result:{"type":"folder"}});
                    } else {
                        fs.readFile(filePath,"binary",function(error,file){
                            if (file.length > 0){
                                res.send({success:true,result:{"type":"file","content":file}});
                            } else {
                                res.send({success:true,result:{"type":"file","content":""}});
                            }
                        });
                    }
                });
            } else {
                res.send({success:false,error:"file_not_found","path":filePath});
            }
        });
    } else {
        res.send({success:false,error:"path_missing"});
    }
});

// SECURITY!!!
function saveHandler(req,res){
    if (typeof(req.param("path"))==="undefined" || req.param("path")===null || req.param("path")===""){
        res.send({success:false,error:"invalid_path",error_message:"No path specified"});
    } else {
        var writePath = path.join(nventPath,req.param("path"));
    
        path.exists(writePath,function(exists){
            if (exists){
                fileUtil.isFolder(writePath,function(isFolder){
                    if (isFolder){
                        res.send({success:true});
                    } else {
                        console.log(writePath);
                        fs.writeFile(writePath,req.param("content"),function(err){
                            res.send({success:true});
                        });
                    }
                });   
            } else {
                if (typeof(req.param("content"))!=="undefined" && req.param("content")!==null){
                    if (req.param("content")===""){
                        //node.js doesn't like writing blank files
                        fs.open(writePath,"w",parseInt("0666",8),function(err){
                            if (err){
                                res.send({success:false});
                            } else {
                                res.send({success:true});
                            }
                        });
                    } else {
                        fs.writeFile(writePath,req.param("content"),function(err){
                            if (err){
                                res.send({success:false});
                            } else {
                                res.send({success:true});
                            }
                        });
                    }
                } else {
                    fs.mkdir(writePath,parseInt("0755",8),function(err){
                        if (err){
                            res.send({success:false});
                        } else {
                            res.send({success:true});
                        }
                    });
                }
            }
        });
    }
}

app.post("/_core/save.json",saveHandler);
app.get("/_core/save.json",saveHandler);

app.get("/_core/delete.json",function(req,res){
    if (core.isBlank(req.param("path"))){
        res.send(core.error("no_path"));
    } else {
        var deletePath = fileUtil.safePath(req.param("path"));
        deletePath = path.join(fileUtil.corePath,deletePath);
        path.exists(deletePath,function(exists){
            if (exists){
                fileUtil.isFolder(deletePath,function(isFolder){
                    if (isFolder){
                        fs.rmdir(deletePath,function(error){
                            if (error){
                                res.send(core.error("delete_dir_error"));
                            } else {
                                res.send(core.success());
                            }
                        });
                    } else {
                        fs.unlink(deletePath,function(error){
                            if (error){
                                res.send(core.error("delete_file_error"));
                            } else {
                                res.send(core.success());
                            }
                        });
                    }
                });
            } else {
                res.send(core.error("invalid_path"));
            }
        });
    }
});

app.get("/_core/files.json",function(req,res){
    // SECURITY!!!
    //console.log(nvent.baseEditPath);
    if (nvent.baseEditPath === null){
        //throw {name:"bad_thing",message:"Bad thing."};
        throw new error.NventError("Bad thing.");
    }
    
    if (nvent.baseEditPath === null){
        // if no edit path is defined, send back an empty list
        res.send(core.error("access_denied"));
    } else {
        //if (typeof(req.param("path"))!=="undefined"){
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
                res.send({result:data,success:true});
            });
        } else {
            //console.log("root");
            data.push({data:"[root]",state:"closed",attr:{"path":"/"}});
            res.send({result:data,success:true});
        }
    }
});
