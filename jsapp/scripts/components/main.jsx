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
	RouteHandler = Router.RouteHandler;

var content = document.getElementById('content');

var MainAppWrap = React.createClass({
	
	componentDidMount: function() {
		Actions.getApplications();
	},

	render: function(){
		return (
			<div>
				<header><Link to="main">Main</Link></header>
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
