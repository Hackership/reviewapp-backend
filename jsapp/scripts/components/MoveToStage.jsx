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
  {AppToolBar} = require('./AppToolBar'),
  moment = require('moment');

var MoveButton = React.createClass({

	getInitialState: function() {
	  return {};
	},

	moveToStage: function(type, evt){
		evt.preventDefault();
		var search_apps = applications.searchFor(this.state.search);
		this.setState({
		    apps: search_apps
		  });
	},


  handleToggle: function(type, evt) {
    evt.preventDefault();
    this.setState({
      isModalOpen: !this.state.isModalOpen,
      type: type
    });
  },


	render: function(){
		 return (
      <div className="app-toolbar">
      <DropdownButton bsStyle="info" className="pull-right" title="Manually Move Stage" block>
          <MenuItem bsStyle="link" onClick={e => this.moveToStage('skyped', e)}>Skyped</MenuItem>
          <MenuItem bsStyle="link" onClick={e => this.moveToStage('grant_review', e)}>Grant Review</MenuItem>
          <MenuItem bsStyle="link" onClick={e => this.moveToStage('accepted', e)}>Accepted, no grant</MenuItem>
          <MenuItem bsStyle="link" onClick={e => this.moveToStage('grant_accepted')}>Grant Accepted</MenuItem>
          <MenuItem bsStyle="link" onClick={e => this.moveToStage(e)}>Deposit Paid</MenuItem>
      </DropdownButton>
      </div>
      );
	}
});


module.exports={MoveButton: MoveButton};