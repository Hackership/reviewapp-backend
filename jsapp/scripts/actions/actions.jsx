
var AppDispatcher = require('../dispatchers/dispatcher'),
    _ = require("underscore"),
    actions = {};

_.each([
    //applications
    "getApplications", "updateApplication", "moveToReview", "moveToEmailReview", "moveToScheduleSkype",

    // Comments & questions
    "postComment", "postQuestion",

    // Email
    "sendEmail", "receiveEmail",

    //User
    "setUser", "setTimezone",

    // Skype Schedule
    "refreshSkypeSlots", "addSkypeSlot", "removeSkypeSlot"

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