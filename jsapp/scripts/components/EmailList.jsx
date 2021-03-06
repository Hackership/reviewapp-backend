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
  {AppHeader} = require('./AppHeader'),
  {user} = require('../stores/UserStore');


var EmailList = React.createClass({
    render: function() {
      var apps = applications.newEmails();

      return(
      	<div className="main">
        	<div className="main-container">
        		<div className="applicationList">
        			<ul className="panel-group">
        			{_.map(apps, (app, index) =>
          			<AppHeader app={app} link="emailPage" />
        			)}
        			</ul>
      			</div>
      		</div>
      	</div>
      )
    }
});

module.exports = {EmailList: EmailList};