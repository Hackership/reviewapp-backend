/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone');

 var Application = Backbone.Model.extend({
    
});

var Applications = Backbone.Collection.extend({
    model: Application,

 byStage: function(stage) {
 	return this.where({"stage": stage});
 },

});

var applications = new Applications();

module.exports = {applications: applications}
