/**
 * @jsx React.DOM
 */

'use strict';

var ReviewsApp = require('./ReviewsApp'),
	AddReviewer = require('./AddReviewer'),
	ApplicationList = require('./ApplicationList'),
	React = require('react'),
	Router = require('react-router'),
	Route = Router.Route,
	Link = require('react-router').Link,
	dispatcher = require('../dispatchers/dispatcher'),
	Actions = require('../actions/actions'),
	RouteHandler = Router.RouteHandler,
	{user} = require('../stores/UserStore');

var content = document.getElementById('content');

var MainAppWrap = React.createClass({
	
	componentDidMount: function() {
		Actions.getApplications();

		var self = this;
    	user.on("all", function(){
      	self.forceUpdate();
    	});
	},

	render: function(){
		console.log('USER:', user.attributes)

		var content = user.attributes.can_admin ? <Link className="btn btn-primary btn-white" to="reviewer"> Add Reviewer</Link> : "";
		return (
			<div>
				<header>
				<Link className="btn btn-primary btn-white" to="main">Main</Link> 
				{content}
				</header>
				<RouteHandler />
			</div>
		)
	}
})

var Routes = (
    <Route path="/" handler={MainAppWrap}>
	    <Route name="reviewer" path="/reviewer/new" handler={AddReviewer} />
	    <Route name="main" path="/" handler={ReviewsApp} />
	  </Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler/>, content);
});
