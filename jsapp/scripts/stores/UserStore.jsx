/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher');


var User = Backbone.Model.extend({
    url: '/api/me'
});
var user = new User();

// Register dispatcher
Dispatcher.register(function(payload) {

  switch(payload.actionType) {
    case 'setUser':
		user.set(payload.payload);
		break;

    case 'setTimezone':
        user.save({"timezone": payload.payload.name}, {patch: true});

    default:
      return true;
  }
});

module.exports = {user: user};