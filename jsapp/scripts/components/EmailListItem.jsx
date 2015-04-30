/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Nav} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {EmailBox} = require('./EmailBox'),
  {applications} = require('../stores/ApplicationStore'),
  markdown = require( "markdown" ).markdown,
  {User, Gravatar} = require("./User"),
  {AppHeaderMixin, ApplicationListHeader} = require('./AppHeader'),
  {user} = require('../stores/UserStore');

var EmailListItem = React.createClass({
		mixins: [AppHeaderMixin],

	render: function() {
    	 var app = applications.get(parseInt(this.props.params.appId));

    return (<div className="main">
        	 <div className="main-container">
        	  <div div className="panel-background">
        		{this.render_header(app, true)}
        	  </div>
       		  <EmailBox emails={app.get('emails')} app_id={app.get('id')} canEdit={false} />
      		</div>
      	</div>);
  }
})

module.exports = {EmailListItem: EmailListItem};