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
  {MoveButton} = require('./MoveToStage'),
  {AppHeaderMixin} = require('../mixins/AppHeaderMixin'),
  moment = require('moment');

let DE_ANON_STAGES = ['skype_scheduled', 'skyped',
                      'accepted', 'rejected', 'grant_review',
                      'deposit_paid', 'grant_accepted',
                      'inactive'];


var ApplicationListHeader = React.createClass({
  mixins: [AppHeaderMixin],
  render(){
      return (
        <li className="panel-background">
          <Link to="appPage" params={{appId: this.props.app.id}}>
            {this.render_header(this.props.app, false)}
          </Link>
        </li>
    )
  }

});

var EmailAppHeader = React.createClass({
  mixins: [AppHeaderMixin],
  render: function() {
    return (
        <li className="panel-background">
          <Link to="emailPage" params={{appId: this.props.app.id}}>
            {this.render_header(this.props.app, false)}
          </Link>
        </li>
    )
  }
});

var Headername = React.createClass({
  render: function(){
    var stages = DE_ANON_STAGES,
        stage = this.props.app.get('stage'),
        anon_name = this.props.app.get('anon_name'),
        name = this.props.app.get('name') ? this.props.app.get('name') : "";

        if (name && _.contains(stages, stage)){
            return (<div className="panel-name">{name}, {anon_name}</div>);
        }
    return (
        <div className="panel-name">{anon_name}</div>
      );
  }
})

var HeaderIcons = React.createClass({
  render: function() {
  return (
      <ul className="panel-icons">
        <li><Glyphicon glyph="envelope"/> {this.props.app.numberOfEmails()}</li>
        <li><Glyphicon glyph="comment" /> {this.props.app.numberOfComments()}</li>
        <li><Glyphicon glyph="question-sign"/> {this.props.app.numberOfQuestions()}</li>
      </ul>
      );
  }
});

var HeaderTxtRev = React.createClass({
  render: function() {
    var app = this.props.app;
    var in_rev = app.attributes.stage === 'in_review';
    var txt = in_rev ? 'Due ' : 'Stage Changed: ';
    var new_txt = app.isNew() ? 'Please review, ' : '';
    var deadline = in_rev? moment(app.attributes.changedStageAt).add(7, 'days').calendar() : moment(app.attributes.changedStageAt).calendar();
    return (
      <h5 className="panel-header"><strong>{new_txt} </strong>{txt}{deadline}</h5>
      );
  }
});

var HeaderTxtMod = React.createClass({
  render: function() {
    var app = this.props.app;
    var in_rev = app.attributes.stage === 'in_review';
    var date = moment(app.attributes.changedStageAt).calendar();
    var due = moment(app.attributes.changedStageAt).add(12, 'days').calendar();
    var deadline = moment(app.attributes.changedStageAt).add(7, 'days').calendar()

    if (in_rev){
      if(app.shouldSendEmail()){
        if(app.isReadyForEmail()){
            return(<h5 className="panel-header urgent"><strong>Ready For E-mail </strong>Due Date: {due}</h5>);
        }
        return(<h5 className="panel-header urgent"><strong style={{color:"red"}}>URGENT</strong> Due Date: {due}</h5>);
      }

      return(<h5 className="panel-header">In Review Until: {deadline}, <strong>Email Due: {due}</strong></h5>)
    }

    return (<h5 className="panel-header">Changed State At: {date}</h5>);
}});


module.exports = {ApplicationListHeader: ApplicationListHeader,
                  AppHeaderMixin: AppHeaderMixin,
                  EmailAppHeader: EmailAppHeader};
