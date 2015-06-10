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

var $=require('jquery');

var AppToolBar =  React.createClass({
   mixins: [OverlayMixin],

  getInitialState: function() {
      return {'isModalOpen': false, 'email': "", 'subject': "", 'motivation': "NONE"};
    },

  dropApplication: function(){
    if (window.confirm("Do you really want to set this application to inactive?")) {
      Action.dropApplication({appId: this.props.app.attributes.id});
    }

  },

  subjectChanged: function(evt) {
    this.setState({
        subject: evt.target.value
      });
  },

  emailChanged: function(evt) {
    this.setState({
            email: evt.target.value
          });
  },

  closeModal: function(){
    this.setState({isModalOpen: false});
  },

  handleToggle: function(type, evt) {
    evt.preventDefault();
    this.setState({
      isModalOpen: !this.state.isModalOpen,
      type: type
    });
  },

  sendEmail: function(){
    Action.sendGeneralEmail({appId: this.props.app.attributes.id, email: this.state.email, subject: this.state.subject});
     this.setState({
        isModalOpen: false
      });
  },

  rejectApplicant: function(){

  },

  render: function(){
    if (user.attributes.can_moderate || user.attributes.can_admin){
      return (
        <div className="app-toolbar">
        <DropdownButton bsStyle="info" className="pull-right" title="Admin Tools" block>
            <MenuItem bsStyle="link" onClick={this.dropApplication}>Applicant Dropped Out</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.handleToggle("email", e)}>Email Applicant</MenuItem>
            <MenuItem bsStyle="link" onClick={e => this.handleToggle("reject", e)}>Reject Applicant</MenuItem>
        </DropdownButton>
        </div>
        );
    }else{
      return (<div></div>)
    }
  },

  renderOverlay: function() {
      if (!this.state.isModalOpen) {
        return <span/>;
      }

      if (this.state.type === 'reject'){
         return (
            <Modal title="Please give a motivation:" bsStyle="primary" onRequestHide={this.closeModal}>
              <div>
                <textarea className="popup" onChange={this.motivationChanged} placeholder="Content" value={this.state.motivation} labelClassName="col-xs-2"
                        wrapperClassName="col-xs-10"/>
                <button className="btn btn-primary" onClick={this.rejectApplicant}>Submit</button>
                <br />
              </div>
            </Modal>
          );}
        return (
            <Modal title="Draft E-mail" bsStyle="primary" onRequestHide={this.closeModal}>
              <div>
                <Input type='text' onChange={this.subjectChanged} placeholder="Subject" value={this.state.subject} labelClassName="col-xs-2"
                        wrapperClassName="col-xs-10"/>
                <textarea className="popup" onChange={this.emailChanged} placeholder="Content" value={this.state.email} labelClassName="col-xs-2"
                        wrapperClassName="col-xs-10"/>
                <button className="btn btn-primary" onClick={this.sendEmail}>Send</button>
                <br />
              </div>
            </Modal>
          );
      }
});

module.exports = {AppToolBar: AppToolBar};