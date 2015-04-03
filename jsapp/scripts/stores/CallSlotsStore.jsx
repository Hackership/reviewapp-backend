/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
 	 Dispatcher = require('../dispatchers/dispatcher'),
     moment = require('moment'),
     availableZones = require("../stores/TimezonesStore"),
     $ = require('jquery');

var Slot = Backbone.Model.extend({
    urlRoot : "/api/call_slots",
    initialize: function(attributes){
        this.ts = moment(attributes.datetime);
    }
});

var Slots = Backbone.Collection.extend({
    model: Slot
})

var collection = new Slots();

// Register dispatcher
Dispatcher.register(function(payload) {

  switch(payload.actionType) {

    case 'setUser':
        collection.reset(payload.payload.timeslots);
        break;

    case 'addCallSlot':
        collection.add(payload.payload).save();
        break;

    case 'removeCallSlot':
        collection.remove(payload.payload).destroy();
        break;

    default:
      return true;
  }
});

module.exports = {slots: collection};

// "fetchSkypeSchedule", "addSkypeSlot", "removeSkypeSlot"