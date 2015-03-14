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

 	getQuestions: function(){
 		var comments = this.get("comments") || null;
 		if (comments){
 			return _.filter(comments, 
    		function(x){return x['question'] === true});
 		}
 		return [];
 	},

 	getComments: function(){
 		var comments = this.get("comments") || null;
 		if (comments){
 			return _.filter(comments, 
    		function(x){return x['question'] === false});
 		}
 		return [];
 	}
    
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

function postComment(payload) {
	var comment = payload['comment'];
	var app_id = payload['appId'];
	var content = payload['question'] ? {comment: comment, question: payload['question']} : {comment: comment};

    $.ajax({
          type: 'POST',
          url: '/application/' + app_id + '/comment',
          data: content,
          }).done(function(resp) {
          	console.log(resp);
          	applications.get(app_id).set(resp.application);
          }).fail(function(msg){
            console.err('ERROR', msg);
          });
}

function moveToReview(payload) {
	var content = payload['anon_content'];
	var app_id = payload['appId'];
	console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' + app_id + '/move_to_stage/in_review',
          data: {anon_content: content},
          }).done(function(resp) {
          	console.log(resp);
          	applications.get(app_id).set(resp.application);
          }).fail(function(msg){
            console.err('ERROR', msg);
          });
}

function sendEmail(payload) {
	var email = payload['email'];
	var app_id = payload['appId'];
	console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' +app_id +'/move_to_stage/email_send',
          data: {email: email},
          }).done(function(resp) {
          	console.log(resp);
          	applications.get(app_id).set(resp.application);
          }).fail(function(msg){
            console.err('ERROR', msg);
          });
}

// Register dispatcher 
Dispatcher.register(function(payload) {
  
  switch(payload.actionType) {
    case 'getApplications':
		getApps()
		break;
	case 'postComment':
		postComment(payload.payload)
		break;
	case 'postQuestion':
		postComment(payload.payload)
		break;
	case 'moveToReview':
		moveToReview(payload.payload)
		break;
	case 'sendEmail':
		sendEmail(payload.payload)

    default:
      return true;
  }
});

module.exports = {applications: applications}
