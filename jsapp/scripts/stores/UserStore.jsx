/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher');


var User = Backbone.Model.extend({});
var user = new User();

// Register dispatcher
Dispatcher.register(function(payload) {

  switch(payload.actionType) {
    case 'setUser':
		user.set(payload.payload);
		break;

    case 'setTimezone':
        user.set("timezone", payload.payload);

    default:
      return true;
  }
});

module.exports = {user: user};