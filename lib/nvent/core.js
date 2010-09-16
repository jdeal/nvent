// core object changes; be careful, changes to Object have side effects!
if (typeof(String.prototype.trim) === "undefined") {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	}
}
if (typeof(String.prototype.startsWith) === "undefined") {
	String.prototype.startsWith = function(s) {
		s = "" + s;
		if (s.length > this.length){
			return false;
		}
		return this.substring(0,s.length) == s;
	}
}
if (typeof(String.prototype.endsWith) === "undefined") {
	String.prototype.startsWith = function(s) {
		s = "" + s;
		if (s.length > this.length){
			return false;
		}
		return this.substring(this.length - s.length) == s;
	}
}

// provide require function for the browser
if (typeof(require) === "undefined") {
	var require = this["require"] = function require(name){
		if (name in require.registry){
			return require.registry[name]
		}
		return null;
	}
	require.registry = {}
	require.registry["nvent/register"] = function(name){
		require.registry[name] = {}
		return require.registry[name]
	}
	require.registry["jquery"] = $
	require.registry["async"] = async
}

(function(exports){

	var isArray = exports.isArray = function isArray(o){
		return Object.prototype.toString.call(o) === '[object Array]';
	}

	var isString = exports.isString = function isString(o){
		return Object.prototype.toString.call(o) === '[object String]';
	}

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
	}

	var array = exports.array = {}

	array.mapExpand = function arrayMapExpand(array,f){
		array = array.map(f)
		var expandedArray = []
		for (var i = 0; i < array.length; i++){
			expandedArray = expandedArray.concat(array[i])
		}
		return expandedArray;
	}

})(typeof exports === 'undefined'? require("nvent/register")("nvent/core") : exports);