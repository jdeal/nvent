importScripts("/_core/lib/fulljslint.js");

function checkCodeQuality(code){// Send back the results to the parent page
    JSLINT(code);
    postMessage(JSON.stringify({errors:JSLINT.errors}));
}

onmessage = function(e){
    var data = JSON.parse(e.data);
    if ( data.type === "checkCodeQuality" ) {
        checkCodeQuality(data.code);
    }
};