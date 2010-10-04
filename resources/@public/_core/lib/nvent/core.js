// core object changes; be careful, changes to Object have side effects!
if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
if (typeof(String.prototype.startsWith) === "undefined") {
    String.prototype.startsWith = function(s) {
        s = "" + s;
        if (s.length > this.length){
            return false;
        }
        return this.substring(0,s.length) == s;
    };
}
if (typeof(String.prototype.endsWith) === "undefined") {
    String.prototype.endsWith = function(s) {
        s = "" + s;
        if (s.length > this.length){
            return false;
        }
        return this.substring(this.length - s.length) == s;
    };
}

// provide require function for the browser
var require;
if (typeof(require) === "undefined") {
    var require = this.require = function require(name){
        if (name in require.registry){
            return require.registry[name];
        }
        return null;
    };
    require.registry = {};
    require.registry["nvent/register"] = function(name){
        require.registry[name] = {};
        return require.registry[name];
    };
    if (typeof($)!=="undefined"){
        require.registry.jquery = $;
    }
    if (typeof(async)!=="undefined"){
        require.registry.async = async;
    }
}

(function(exports){

    var isUndefined = exports.isUndefined = function(value){
        if (typeof(value)==="undefined"){
            return true;
        }
        return false;
    };

    var isNothing = exports.isNothing = function(value){
        if (typeof(value)==="undefined" || value===null){
            return true;
        }
        return false;
    };
    
    var isBlank = exports.isBlank = function(value){
        if (isNothing(value) || value===""){
            return true;
        }
        return false;
    };

    var isArray = exports.isArray = function isArray(o){
        return Object.prototype.toString.call(o) === '[object Array]';
    };

    var isString = exports.isString = function isString(o){
        return Object.prototype.toString.call(o) === '[object String]';
    };
    
    var isFunction = exports.isFunction = function isFunction(o){
        return Object.prototype.toString.call(o) === "[object Function]";
    };
    
    var error = exports.error = function error(name,message){
        if (isUndefined(message)){
            if (isUndefined(name)){
                return error("UnknownError");
            } else {
                return error(name,"Error: " + name);
            }
        } else {
            return {success:false,error:{name:name,message:message}};
        }
    };
    
    var isError = exports.isError = function isError(json){
        if ("success" in json){
            return !json.success;
        } else {
            return false;
        }
    };
    
    var isSuccess = exports.isSuccess = function isErrorResponse(json){
        return !isError(json);
    };
    
    var errorName = exports.errorName = function errorName(json){
        if (isError(json)){
            if ("success" in json){
                if ("error" in json && "name" in json.error){
                    return json.error.name;
                } else {
                    return "UnknownError";
                }
            } else {
                return "InvalidResultError";
            }
        } else {
            return null;
        }
    };
    
    var errorMessage = exports.errorMessage = function errorMessage(json){
        if (isError(json)){
            if ("success" in json){
                if ("error" in json && "message" in json.error){
                    return json.error.message;
                } else if ("error" in json && "name" in json.error){
                    return "Error: " + json.error.name;
                } else {
                    return "Unknown error.";
                }
            } else {
                return "Invalid result format.";
            }
        } else {
            return null;
        }
    };
    
    var success = exports.success = function success(result){
        if (isUndefined(result)){
            return {success:true};
        } else {
            return {success:true,result:result};
        }
    };
    
    var successResult = exports.successResult = function successResult(json){
        if (isError(json)){
            return null;
        } else if ("result" in json) {
            return error.result;
        } else {
            return null;
        }
    };

    var getObject = exports.getObject = function getObject(parts,obj,create){

        if ( typeof parts === 'string' ) {
            parts = parts.split('.');
        }

        var p;

        while (obj && parts.length ) {
            p = parts.shift();
            if ( obj[p] === undefined && create ) {
                obj[p] = {};
            }

            obj = obj[p];
        }

        return obj;
    };

    var array = exports.array = {};

    array.mapExpand = function arrayMapExpand(array,f){
        array = array.map(f);
        var expandedArray = [];
        for (var i = 0; i < array.length; i++){
            expandedArray = expandedArray.concat(array[i]);
        }
        return expandedArray;
    };

})(typeof exports === 'undefined'? require("nvent/register")("nvent/core") : exports);
