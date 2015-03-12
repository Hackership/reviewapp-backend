/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher');

var $=require('jquery');

 var User = Backbone.Model.extend({      
});

 
var user = new User();

// Register dispatcher 
Dispatcher.register(function(payload) {
  
  switch(payload.actionType) {
    case 'setUser':
		user.set(payload.payload);
        console.log('STORE:', payload.payload)
		break;

    default:
      return true;
  }
});

module.exports = {user: user};