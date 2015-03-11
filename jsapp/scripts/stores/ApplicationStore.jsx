/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone');

 var Application = Backbone.Model.extend({
    
});

var Applications = Backbone.Collection.extend({
    model: Application

 byStage: function(stage) {
    filtered = this.filter(function(app) {
      return app.get("stage") === stage;
      });
    return new Applications(filtered);
  }

});

var incoming = Applications.byStage("incoming");
var in_review = Applications.byStage('in_review');
var email_send = Applications.byStage('email_send');
var reply_received = Applications.byStage('reply_received');
var skyped = Applications.byStage('skyped');


module.exports = incoming, in_review, email_send, reply_received, skyped;