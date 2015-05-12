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
  {ApplicationsList} = require('./ApplicationsList'),
  moment = require('moment');

var Search = React.createClass({

	getInitialState: function() {
	  return {apps: applications, search: ""};
	},

	searchChanged: function(evt) {
	this.setState({
	    search: evt.target.value
	  });
	},

	searchByName: function(){
	this.setState({
	    apps: applications.application_with_name(this.state.search)
	  });
	},

	render: function(){
		return (<div>
					 <Input type='text' onChange={this.searchChanged} placeholder="search by name" value={this.state.search} labelClassName="col-xs-2"
                        wrapperClassName="col-xs-10"/>
                     <Button onClick={this.searchByName}>Search</Button>
                     <ApplicationsList apps={this.state.apps} />
                </div>)
	}
});

module.exports = {Search: Search};