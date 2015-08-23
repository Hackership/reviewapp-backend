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
  Action = require('../actions/actions'),
  markdown = require( "markdown" ).markdown,
  {Link} = require('react-router'),
  moment = require('moment');

var MoveButton = React.createClass({

	getInitialState: function() {
	  return {};
	},

	moveToStage: function(type, evt){
		evt.preventDefault();
		if (window.confirm("By moving stages manually NO automatic emails will be send")) {
			Action.moveToStage({stage: type, appId: this.props.app.get('id')});
		}
	},

	render: function(){
		 if (user.attributes.can_moderate || user.attributes.can_admin){
       return (
        <div className="app-toolbar">
        <DropdownButton bsStyle="info" className="" title="Move Stage" block>
            <MenuItem bsStyle="link" onClick={e => this.moveToStage('skyped', e)}>Skyped</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.moveToStage('grant_review', e)}>Grant Review</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.moveToStage('accepted', e)}>Accepted, no grant</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.moveToStage('grant_accepted', e)}>Grant Accepted</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.moveToStage('deposit_paid', e)}>Deposit Paid</MenuItem>
        </DropdownButton>
        </div>
        );
     }else{
      return (<div></div>)
     }
	}
});


module.exports={MoveButton: MoveButton};