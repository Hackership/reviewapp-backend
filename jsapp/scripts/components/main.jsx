/**
 * @jsx React.DOM
 */

'use strict';

var {ReviewsApp} = require('./ReviewsApp'),
	{FocusReview} = require('./ReviewsApp'),
	AddReviewer = require('./AddReviewer'),
	{ApplicationList} = require('./ApplicationList'),
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

		var content = user.attributes.can_admin ? <Link className="btn btn-primary btn-white" to="reviewer"> Add Reviewer</Link> : "";
		var login = user.attributes.id ? <a className="btn btn-primary" target="_blank" href="/logout">Logout </a> : <a className="btn btn-primary" target="_blank" href="/login">Login </a> 
		return (
			<div>
				<header>
				<Link className="btn btn-primary" to="main">Main</Link> 
				<Link className="btn btn-primary" to="focus">Focus Mode</Link> 
				{content}
				{login}
				<a className="btn btn-white" target="_blank" href="http://community.hackership.org/c/reviewers">Help </a> 
				<a className="btn btn-white" target="_blank" href="http://community.hackership.org/c/reviewers">Bug Report</a>
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
	    <Route name="focus" path="/focus" handler={FocusReview} />
	</Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler/>, content);
});
