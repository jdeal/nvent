var core = require('nvent/core');

var ErrorConstructor = require("commonjs-utils/extend-error").ErrorConstructor;

var NventError = exports.NventError = ErrorConstructor("NventError");

var defaultErrorMessages = {};

function createErrorType(name,defaultMessage){
    exports[name] = ErrorConstructor(name,NventError);
    defaultErrorMessages[name] = defaultMessage;
}

createErrorType("UnknownError","There was an unknown error.");
createErrorType("NotImplementedError","That feature is not yet implemented.");
createErrorType("AccessDeniedError","Access is denied for that function.");
createErrorType("PathRequiredError","A path is required for that action.");
createErrorType("InvalidPathError","That path is invalid.");
createErrorType("DirectoryDeleteError","There was a problem deleting the directory.");
createErrorType("FileDeleteError","There was a problem deleting the file.");
createErrorType("FileNotFoundError","File not found.");
createErrorType("FileWriteError","There was a problem writing to the file.");
createErrorType("DirectoryWriteError","There was a problem writing to the directory.");

var createError = exports.create = function createError(name,message){
    if (!(name in exports)){
        throw new NventError("An error was thrown, but the type (" + name + ") was unknown.");
    }
    if (core.isUndefined(message)){
        if (core.isFunction(defaultErrorMessages[name])){
            return new exports[name](defaultErrorMessages[name]());
        } else {
            return new exports[name](defaultErrorMessages[name]);
        }
    } else {
        return new exports[name](message);
    }
};
