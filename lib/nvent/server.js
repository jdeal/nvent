var express = require("express");
var path = require("path");
var fileUtil = require("nvent/util/file")
var fs = require("fs");

var app = exports.server = express.createServer();

app.configure(function(){
	app.use(express.staticProvider(path.join(__dirname,'../../resources/@public')));
});

var fakeData = [
	{ "data" : "A node", "children" : [ { "data" : "Only child", "state" : "closed" } ], "state" : "open" },
	"Ajax node"
];

app.get("/_core/restart.json",function(req,res){
	res.send({success:true});
	app.close();
	process.exit();
})

app.get("/_core/file.json",function(req,res){
	// SECURITY!!!
	if (typeof(req.param("path"))!=="undefined"){
		var filePath = path.join(__dirname,"../..",req.param("path"));
		path.exists(filePath,function(exists){
			if (exists){
				fileUtil.isFolder(filePath,function(isFolder){
					if (isFolder){
						res.send({success:true,result:{"type":"folder"}})
					} else {
						fs.readFile(filePath,"binary",function(error,file){
							if (file.length > 0){
								res.send({success:true,result:{"type":"file","content":file}})
							} else {
								res.send({success:true,result:{"type":"file","content":""}})
							}
						})
					}
				})
			} else {
				res.send({success:false,error:"file_not_found","path":filePath})
			}
		})
	} else {
		res.send({success:false,error:"path_missing"})
	}
})

app.get("/_core/files.json",function(req,res){
	// SECURITY!!!
	var serverPath = path.join(__dirname,"../..")
	var basePath = "/";
	if (typeof(req.param("path"))!=="undefined"){
		serverPath = path.join(serverPath,req.param("path"));
		basePath = req.param("path");
	}
	fileUtil.dir(serverPath,function(error,filesAndFolders){
		var data = [];
		filesAndFolders.forEach(function(f){
			if (f.isFolder){
				data.push({data:f.name,state:"closed",attr:{"path":path.join(basePath,f.name)}})
			} else {
				data.push({data:f.name,attr:{"path":path.join(basePath,f.name)}})
			}
		})
		res.send({result:data,success:true});
	})
	/*
	fileUtil.folders(path.join(__dirname,"../.."),function(error,folders){
		var data = [];
		folders.forEach(function(folder){
			data.push({"data":folder})
		})
		res.send(data);
	})
	*/
	//res.send(fakeData);
})