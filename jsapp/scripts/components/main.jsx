/**
 * @jsx React.DOM
 */

'use strict';

var {StagesView, AppsList, FocusReview} = require('./ReviewsApp'),
	AddReviewer = require('./AddReviewer'),
	CallSlots = require('./CallSlots'),
	{ApplicationList, ApplicationPage} = require('./ApplicationList'),
	{Gravatar} = require("./User"),
	React = require('react'),
	Router = require('react-router'),
	{Alert, ProgressBar, DropdownButton, MenuItem}  = require('react-bootstrap'),
	Route = Router.Route,
	Link = require('react-router').Link,
	dispatcher = require('../dispatchers/dispatcher'),
	Actions = require('../actions/actions'),
	RouteHandler = Router.RouteHandler,
  	{applications} = require('../stores/ApplicationStore'),
	{user} = require('../stores/UserStore'),
	{EmailList} = require('./EmailList'),
	{EmailListItem} = require('./EmailListItem'),
	_ = require("underscore");

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

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

		var menu = [];
		if (user.get("can_skype")){
			menu.push(<MenuItem key='callslots'><Link to="callslots"> Manage Call Slots</Link></MenuItem>)
		}

		if (user.get("can_admin")){
			menu.push(<MenuItem key="admin-in" divider />)
			menu.push(<MenuItem key='add-admin'><a href="/admin"> Admin Area</a></MenuItem>)
			menu.push(<MenuItem key='add-reviewer'><Link to="reviewer"> Add Reviewer</Link></MenuItem>)
			menu.push(<MenuItem key="admin-out" divider />)
		}
		menu.push(<MenuItem key='logout'><a href="/logout">Logout </a></MenuItem>)


		var me = <Gravatar hash={user.get("gravatar")} size={25} />


		return (
			<div>
				<header>
					<Link className="btn btn-primary" to="main">Main</Link>
					<Link className="btn btn-primary" to="focus">Focus Mode</Link>
					<Link className="btn btn-primary" to="emails">New Emails</Link>
					<DropdownButton bsStyle="info" className="pull-right" title={me}>
						{menu}
						<MenuItem divider />
						<MenuItem>
							<a target="_blank" href="http://community.hackership.org/c/reviewers">Help </a> 
						</MenuItem>
						<MenuItem>
							<a target="_blank" href="http://community.hackership.org/c/reviewers">Bug Report</a>
						</MenuItem>
					</DropdownButton>
				</header>
				<RouteHandler {...this.props}/>
			</div>
		)
	}
})

var Routes = (
    <Route path="/" handler={MainAppWrap}>
	    <Route name="reviewer" path="/reviewer/new" handler={AddReviewer} />
	    <Route name="emails" path="/emails/new" handler={EmailList} />
	    	 <Route name="emailPage" path="/emails/app/:appId" handler={EmailListItem} />
	    <Route name="callslots" path="/calls/slots" handler={CallSlots} />
	    <Route name="main" path="/" handler={StagesView}>
	    	<Route name="appStage" path=":stage/" handler={AppsList} />
	    </Route>
	    <Route name="appPage" path="/app/:appId" handler={ApplicationPage} />
	    <Route name="focus" path="/focus" handler={FocusReview} />
	</Route>
);

Router.run(Routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params} />, content);
});
