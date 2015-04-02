/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher'),
     $ = require('jquery');

var Slot = Backbone.Model.extend({});

var Slots = Backbone.Collection({
    model: Slot
})

var collection = new Slots();

// Register dispatcher
Dispatcher.register(function(payload) {

  switch(payload.actionType) {
    case 'fetchSkypeSchedule':
		collection.fetch();
		break;

    default:
      return true;
  }
});

module.exports = {slots: collection};

// "fetchSkypeSchedule", "addSkypeSlot", "removeSkypeSlot"