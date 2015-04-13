/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Actions = require('../actions/actions'),
 	 moment = require('moment'),
 	 _ =require('underscore'),
   {user} = require('./UserStore'),
 	 Dispatcher = require('../dispatchers/dispatcher');

var $=require('jquery');

 var Application = Backbone.Model.extend({

  shouldSendEmail: function(){
    var weekAgo = moment().subtract(7, 'days');
    return moment(this.changedStageAt) < weekAgo;
  },

  isReadyForEmail: function(){
    return (this.getQuestions().length > 0);
  },

  numberOfComments: function(){
    return this.getComments().length;
  },

  numberOfQuestions: function(){
    return this.getQuestions().length;
  },

  numberOfEmails: function(){
    return this.getEmails().length;
  },

 	getComments: function(){
 		var comments = this.get("comments") || null;
 		if (comments){
 			return _.filter(comments, 
    		function(x){return x['question'] === false});
 		}
 		return [];
 	},

  getQuestions: function(){
    var comments = this.get("comments") || null;
    if (comments){
      return _.filter(comments, 
        function(x){return x['question'] === true});
    }
    return [];
  },

  getEmails: function(){
    return this.get("emails");
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

    byUrgency: function(role) {
      var review_apps,
          reply_apps;

      if (role === 'reviewer') {
         review_apps = _.sortBy(_.filter(this.where({'stage': 'in_review'}), function(app){
             return !(_.find(app.get('comments'), function(comment){
                console.log(comment['author']);
                return ((comment['author']['id'] === user.get('id')) && comment['question']);
             }));
          }), 'changedStageAt');

          reply_apps = _.sortBy(this.where({'stage': 'review_reply'}), 'changedStageAt');

          return _.flatten([review_apps, reply_apps]);
      }

      else if (role === 'moderator'){
        return _.sortBy(_.flatten([this.toEmail(), this.byStage('reply_received')]), 'changedStageAt');
      }

      else if (role === 'admin'){
        return _.sortBy(_.flatten([this.byStage('incoming'), this.byStage('reply_received')]), 'changedStageAt');
      }

}});

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

function moveToEmailReview(payload) {
  var content = payload['content'];
  var app_id = payload['appId'];
  console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' + app_id + '/move_to_stage/review_reply',
          data: content,
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

function moveToScheduleSkype(payload) {
  var app_id = payload['appId'];
  console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' +app_id +'/move_to_stage/schedule_skype',
          }).done(function(resp) {
            console.log(resp);
            applications.get(app_id).set(resp.application);
          }).fail(function(msg){
            console.err('ERROR', msg);
          });
}

function dropApplication(payload) {

  var app_id = payload['appId'];
  console.log('appId', app_id);
  $.ajax({
          type: 'POST',
          url: '/application/' +app_id +'/move_to_stage/inactive',
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
  case 'moveToEmailReview':
    moveToEmailReview(payload.payload)
    break;
	case 'sendEmail':
		sendEmail(payload.payload)
    break;
  case 'moveToScheduleSkype':
    moveToScheduleSkype(payload.payload)
    break;
  case 'dropApplication':
    dropApplication(payload.payload)
    break;

    default:
      return true;
  }
});

module.exports = {applications: applications}
