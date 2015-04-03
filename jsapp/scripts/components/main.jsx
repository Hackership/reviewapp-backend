/**
 * @jsx React.DOM
 */

'use strict';

var {ReviewsApp} = require('./ReviewsApp'),
	{FocusReview} = require('./ReviewsApp'),
	AddReviewer = require('./AddReviewer'),
	CallSlots = require('./CallSlots'),
	{ApplicationList} = require('./ApplicationList'),
	React = require('react'),
	Router = require('react-router'),
	{Alert, ProgressBar}  = require('react-bootstrap'),
	Route = Router.Route,
	Link = require('react-router').Link,
	dispatcher = require('../dispatchers/dispatcher'),
	Actions = require('../actions/actions'),
	RouteHandler = Router.RouteHandler,
  	{applications} = require('../stores/ApplicationStore'),
	{user} = require('../stores/UserStore'),
	_ = require("underscore");

var content = document.getElementById('content');

var MainAppWrap = React.createClass({

	getInitialState: function(){
		return {loading: 10};
	},
	componentWillMount: function() {

		var self = this;
    	user.on("all", function(){
      		self.setState({loading: self.state.loading + 45});
    	});
	    applications.on("all", function(){
	      self.setState({loading: self.state.loading + 45});
	    });
		Actions.getApplications();
	},

	render: function(){
		if (this.state.loading < 100){
			return (<Alert bsStyle='info'>
          				<h4>loading app</h4>
          				<ProgressBar active now={this.state.loading} />
        			</Alert>);
		}

		if (!user.attributes.id){
			return (<Alert bsStyle='warning'>
          				<h4>Not logged in</h4>
          				<p>You need to login to use this app.</p>
          				<p><a className="btn btn-primary" target="_blank" href="/login">Login </a></p>
        			</Alert>);
		}

		var menu = []
		if (user.get("can_admin")){
			menu.push(<Link key='admin' className="btn btn-primary btn-white" to="reviewer"> Add Reviewer</Link>)
		}
		if (user.get("can_skype")){
			menu.push(<Link key='callslots' className="btn btn-primary btn-white" to="callslots"> Manage Call Slots</Link>)
		}
		menu.push(<a key='logout' className="btn btn-primary" href="/logout">Logout </a>)


		return (
			<div>
				<header>
					<Link className="btn btn-primary" to="main">Main</Link>
					<Link className="btn btn-primary" to="focus">Focus Mode</Link>
					{menu}
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
	    <Route name="callslots" path="/calls/slots" handler={CallSlots} />
	    <Route name="main" path="/" handler={ReviewsApp} />
	    <Route name="focus" path="/focus" handler={FocusReview} />
	</Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler/>, content);
});
