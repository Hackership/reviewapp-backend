/**
 * @jsx React.DOM
 */

'use strict';

var ReviewsApp = require('./ReviewsApp');
var AddReviewer = require('./AddReviewer');
var ApplicationList = require('./ApplicationList');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = require('react-router').Link;
var RouteHandler = Router.RouteHandler;

var content = document.getElementById('content');

var MainAppWrap = React.createClass({
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
