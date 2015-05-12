
var AppDispatcher = require('../dispatchers/dispatcher'),
    _ = require("underscore"),
    actions = {};

_.each([
    "bootstrap", "forceRefresh",

    //applications
    "getApplications", "updateApplication", "moveToReview", "moveToEmailReview", "moveToScheduleSkype",
    "moveToSkyped", "dropApplication", "moveToAccepted", "moveToGrantReview",
    "moveToGrantAccepted", "moveToDepositPaid",

    // Comments & questions
    "postComment", "postQuestion", "editComment",

    // Email
    "sendEmail", "receiveEmail", "sendGeneralEmail", "anonymizeEmails",

    //User
    "setUser", "setTimezone",

    // Call Schedule
    "addCallSlot", "removeCallSlot", "clearCallSlots"

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