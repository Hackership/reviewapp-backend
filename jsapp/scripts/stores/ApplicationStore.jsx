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
    return moment(this.attributes.changedStageAt) < weekAgo;
  },

  isNew: function(){
    var auth_questions;

    if(this.attributes.stage === 'in_review') {

      auth_questions = _.filter(this.attributes.comments, function(comment){
        return ((comment['author']['id'] === user.get('id')) && comment['question']);
      });

      if (auth_questions.length > 0){
        return false
      }
      return true
    }
    return true
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
  },

  newEmails: function(){
    return _.filter(this.get('emails'), email => !email.anon_content).length > 0
  }

});

var Applications = Backbone.Collection.extend({
    model: Application,

    newEmails: function(){
      return _.filter(this.models, a => _.filter(a.get('emails'), email => email.anon_content).length > 0);
    },

    toEmail: function(){
    	var weekAgo = moment().subtract(7, 'days');

    	return _.filter(this.where({"stage": 'in_review'}),
        function(x){return moment(x.attributes.changedStageAt) < weekAgo});
    },

   	byStage: function(stage) {
   		return this.where({"stage": stage});
    },

    stageCounts: function(){
      return _.countBy(this.models, a => a.get('stage'));
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

function moveToSkyped(payload) {
  var app_id = payload['appId'];
  console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' +app_id +'/move_to_stage/skyped',
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

function sendGeneralEmail(payload){
  var email = payload['email'];
  var subject = payload['subject'];
  var app_id = payload['appId'];
  console.log('appId', app_id);


    $.ajax({
          type: 'POST',
          url: '/application/' +app_id +'/send_email',
          data: {email: email, subject: subject},
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

function availableStages() {
  var stages = [
    {key: 'in_review', title: 'To Review', instruction: "Review Stage. Please read through this application and add questions for the applicant in the box below."},
    {key: 'email_send', title: 'Emailed', instruction: "Email Send. No Action Required."},
    {key: 'review_reply', title: 'Review Reply', instruction: "Email Review Stage. Please review the applicant's email answers to our questions. Add any comments or further questions you have in the boxes below!"},
    {key: 'schedule_skype', title: 'Skype Invite Sent', instruction: "Skype Invitation Stage. The applicant has received an e-mail to schedule a Skype call. If needed: add additional comments and questions below!"},
    {key: 'skype_scheduled', title: 'Skype Scheduled', instruction: "Skype Scheduled. Please leave comments for the interviewers" },
    {key: 'skyped', title: 'Skyped', instruction: "Skyped! Decision time, do we accept this applicant yes/no? Please leave comments here. "}
    ];

  if (user.attributes.can_admin) {
      stages.splice(0, 0, {key: 'incoming', title: "Incoming", instruction: "Anonymization Stage. Please Anonymize this application by removing names and other identifiers"});
  }

  if (user.attributes.can_moderate) {
      stages.splice(3,0, {key: 'reply_received', title: "Reply Incoming", instruction: "Email Anonymization Stage. Please anonymize replies by removing names, emails and other identifiers."});
  }

  return stages;
}

var getInstructionForStage = function(stage){
  return  _.filter(availableStages(), st => (st.key === stage))[0].instruction;
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
  case "sendGeneralEmail":
    sendGeneralEmail(payload.payload)
    break;
  case "moveToSkyped":
    moveToSkyped(payload.payload)
    break;

    default:
      return true;
  }
});

module.exports = {applications: applications,
                  availableStages: availableStages,
                  getInstructionForStage: getInstructionForStage}
