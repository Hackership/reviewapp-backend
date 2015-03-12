/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Actions = require('../actions/actions'),
 	 moment = require('moment'),
 	 _ =require('underscore'),
 	 Dispatcher = require('../dispatchers/dispatcher');

var $=require('jquery');

 var Application = Backbone.Model.extend({
    
});

var Applications = Backbone.Collection.extend({
    model: Application,

    toEmail: function(){
    	var weekAgo = moment().subtract(7, 'days');
    
    	return _.filter(this.where({"stage": 'in_review'}), 
    		function(x){return moment(x.changedStageAt) < weekAgo});
    },

 	byStage: function(stage) {
 		return this.where({"stage": stage});
 },

});

var applications = new Applications();

function getApps() {
	$.getJSON("/api/app_state", function(data) {
		applications.set(data['applications']);
    	Actions.setUser(data['user']);
    })
	.done(function(data){
    })
    
    .fail(function(data){
    	console.log(data)
    	alert('Failed to get applications');
   });
}



// Register dispatcher 
Dispatcher.register(function(payload) {
  
  switch(payload.actionType) {
    case 'getApplications':
		getApps()
		break;

    default:
      return true;
  }
});

module.exports = {applications: applications}
