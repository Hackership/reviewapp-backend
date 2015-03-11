/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher');

var $=require('jquery');

 var Application = Backbone.Model.extend({
    
});

var Applications = Backbone.Collection.extend({
    model: Application,

    getApps: function() {
    	$.getJSON("url", function(data) {
    		})
    	.done(function(data){
    		console.log(data)
    	})
    	.fail(function(){
    		alert('Failed to get applications');
    	});
    },

 	byStage: function(stage) {
 		return this.where({"stage": stage});
 },

});

var applications = new Applications();

// Register dispatcher 
Dispatcher.register(function(payload) {
  
  switch(payload.actionType) {
    case 'getApplications':
		applications.getApps()
		break;

    default:
      return true;
  }
});

module.exports = {applications: applications}
