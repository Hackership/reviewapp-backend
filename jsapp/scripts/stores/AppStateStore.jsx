/**
 * @jsx React.DOM
 */

'use strict';
 var Backbone = require('backbone'),
     Actions = require('../actions/actions'),
     moment = require('moment'),
     {applications} = require('./ApplicationStore'),
     Dispatcher = require('../dispatchers/dispatcher');

var AppState = Backbone.Model.extend({});

// a global app state telling us about the latest updates
// of our data

var appState = new AppState({
  loading: true,
  last_updated: moment("1970-01-01")
});

applications.on("all", function(){
  appState.set({last_updated: moment(), loading: false});
});

function refreshApplications(){
  // we just fire away!
  appState.set({loading: true});
  Actions.getApplications();
}


function bootstrap(){
  // actions can't trigger other actions
  // immediately at least – and for the bootstrap
  // this is exactly what we want to do.
  setTimeout(refreshApplications, 1);

  // also. keep em up to date:
  // we want to reload every five minutes!
  setInterval(refreshApplications, 1000 * 60 * 5);
}

// Register dispatcher
Dispatcher.register(function(payload) {
  if (payload.actionType === 'bootstrap') bootstrap();
  if (payload.actionType === 'forceRefresh') setTimeout(refreshApplications, 1);
});

module.exports = {appstate: appState}