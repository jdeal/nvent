var core = require("nvent/core");

(function(exports){

    if (core.isDefined($)){
    
        exports.getJSON = function getJSON(url,data,success,error){
            if (core.isFunction(data)){
                error = error || success;
                success = data;
                data = {};
            }
            var options = {};
            options.dataType = 'json';
            options.url = url;
            options.data = data;
            if (core.isDefined(success)){
                options.success = success;
            }
            if (core.isDefined(error)){
                options.error = error;
            }
            $.ajax({
                url: url,
                dataType: 'json',
                data: data,
                success: success,
                error: error
            });
        };
    }

})(typeof exports === 'undefined'? require("nvent/register")("nvent/client") : exports);