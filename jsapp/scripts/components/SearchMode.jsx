/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Modal, ButtonToolbar, Panel, DropdownButton, MenuItem, Input, Well, Col, Row, Grid, Glyphicon, Accordion, PanelGroup, OverlayMixin, Button}  = require('react-bootstrap'),
  {User, Gravatar} = require("./User"),
  ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  {Link} = require('react-router'),
  {applications} = require('../stores/ApplicationStore'),
  {AppToolBar} = require('./AppToolBar'),
  {ApplicationList} = require('./ApplicationList'),
  moment = require('moment');

var Search = React.createClass({

	componentDidMount() {
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },


	getInitialState: function() {
	  return {apps: applications.models, search: ""};
	},

	searchChanged: function(evt) {
		this.setState({
		    search: evt.target.value
		  });
	},

	searchByName: function(){
		var search_apps = applications.searchFor(this.state.search);
		this.setState({
		    apps: search_apps
		  });
	},

	render: function(){
		return (  <div className="main">
			    	<div className="main-container">
			    	<div className="searchBox row">
						 <Input type='text' onChange={this.searchChanged} placeholder="search by name" value={this.state.search}
	                        wrapperClassName="col-xs-8" buttonAfter={<Button bsStyle="success" bsSize="medium" onClick={this.searchByName}  wrapperClassName="col-xs-2">Search</Button>}/>
	                  </div>   
	                     <ApplicationList apps={this.state.apps} />
                   </div>
                </div>)
	}
});

module.exports = {Search: Search};