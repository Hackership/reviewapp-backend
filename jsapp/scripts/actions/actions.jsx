
var AppDispatcher = require('../dispatchers/dispatcher'),
    _ = require("underscore"),
    actions = {};

_.each([
    //applications
    "getApplications", "updateApplication",

    // Comments & questions
    "postComment",

    // Email
    "sendEmail", "receiveEmail",

    //User
    "setUser"

    ],
    function(name){
    actions[name] = function(payload){
        return AppDispatcher.dispatch({
            actionType: name,
            payload: payload
        });
    }
}); 

module.exports = actions;