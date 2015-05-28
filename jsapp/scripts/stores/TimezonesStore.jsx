
var moment = require('moment'),
    moment_tz = require('moment-timezone/moment-timezone'),
    zones = require("../data/timezones"),
    _ = require("underscore");

moment.tz.load(zones);

var availableZones = _.map(zones.zones, function(x){
    var name = x.split('|')[0];
    return {value: name, label: name.replace("_", " "), name: name};
});

module.exports = availableZones;
