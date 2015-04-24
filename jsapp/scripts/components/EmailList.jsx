/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	{Nav} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  {user} = require('../stores/UserStore');


var EmailList = React.createClass({
    render() {
      var app_list = applications.newEmails();
      return <ApplicationList apps={app_list} />
    }
});


module.exports={EmailList: EmailList};