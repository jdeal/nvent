var fs = require("fs");
var async = require("async");
var path = require("path");
var core = require("nvent/core");

exports.isFolder = isFolder = function isFolder(folderPath,callback){
    var fullPath = folderPath;
    if (core.isArray(folderPath)){
        fullPath = folderPath[1];
    }
    fs.stat(fullPath,function(error,stats){
        if (error) {
            callback(false);
        } else {
            callback(stats.isDirectory());
        }
    });
};

exports.folders = function getFolders(basePath,callback){
    fs.readdir(basePath,function(error,files){
        if (error){
            callback(error);
        } else {
            // map names to list of [name,fullPath]
            fileNameAndPathList = files.map(function(file){return [file,path.join(basePath,file)];});
            async.filter(fileNameAndPathList,isFolder,function(folderArrays){
                folders = folderArrays.map(function(array){return array[0];});
                callback(null,folders);
            });
        }
    });
};

exports.dir = function getDir(basePath,callback){
    fs.readdir(basePath,function(error,files){
        if (error){
            callback(error);
        } else {
            // map names to list of [name,fullPath]
            fileNameAndPathList = files.map(function(file){return [file,path.join(basePath,file)];});
            async.map(fileNameAndPathList,function(fileNameAndPath,callback){
                isFolder(fileNameAndPath,function(yes){
                    callback(null,{name:fileNameAndPath[0],isFolder:yes});
                });
            },function(error,filesAndFolders){
                callback(null,filesAndFolders);
            });
        }
    });
};

exports.firstFileInFolder = function inFolder(basePath,files,callback){
    async.detectSeries(files,function(file,callback){
        var fullPath = path.join(basePath,file);
        fs.stat(fullPath,function(error,stats){
            if (error) {
                // todo: some errors can't be ignored
                callback(false);
            } else {
                if (stats.isFile()) {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        });
    },function(file){
        if (typeof(file)!="undefined") {
            callback(file);
        } else {
            callback(null);
        }
    });
};

var corePath = exports.corePath = path.join(__dirname,"../../..");

var safePath = exports.safePath = function safePath(unsafePath){
    return path.join('',unsafePath);
};