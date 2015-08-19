var React = require('react/addons'),
  _ = require('underscore'),
  {Modal, ButtonToolbar, Panel, DropdownButton, MenuItem, Input, Well, Col, Row, Grid, Glyphicon, Accordion, PanelGroup, OverlayMixin, Button}  = require('react-bootstrap'),
  {User, Gravatar} = require("../components/User"),
  ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  {AppToolBar} = require('../components/AppToolBar'),
  {MoveButton} = require('../components/MoveToStage'),
  {HeaderTxtMod, HeaderTxtRev} = require('../components/AppHeader'),
  moment = require('moment');

let DE_ANON_STAGES = ['skype_scheduled', 'skyped',
                      'accepted', 'rejected', 'grant_review',
                      'deposit_paid', 'grant_accepted',
                      'inactive'];

function userName(app){
  var stages = DE_ANON_STAGES,
      stage = app.get('stage'),
      name = app.get('name'),
      anon_name = app.get('anon_name');

        if (app.get('name') && _.contains(stages, app.get('stage'))){
            return name +" -- "+ anon_name;
        }
    return anon_name;
}

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

var AppStatusRev = React.createClass({
  render: function() {
    var app = this.props.app;
        in_rev = app.get("stage") === 'in_review';
        txt = in_rev ? 'Due ' : 'Stage Changed: ';
        new_txt = app.isNew() ? 'Please review, ' : '';
        deadline = in_rev? moment(app.attributes.changedStageAt).add(7, 'days').calendar() : moment(app.attributes.changedStageAt).calendar();
    return (
      <h5 className="panel-header"><strong>{new_txt} </strong>{txt}{deadline}</h5>
      );
  }
});

var AppStatusMod = React.createClass({
  render: function() {
    var app = this.props.app,
        date = moment(app.attributes.changedStageAt).calendar(),
        due = moment(app.attributes.changedStageAt).add(12, 'days').calendar(),
        deadline = moment(app.attributes.changedStageAt).add(7, 'days').calendar();

    if (app.attributes.stage === 'in_review'){
      if(app.shouldSendEmail()){

        if (app.isReadyForEmail()){
            return(<h5 className="panel-header urgent"><strong>Ready For E-mail </strong>Due Date: {due}</h5>);
        }
        return(<h5 className="panel-header urgent"><strong style={{color:"red"}}>URGENT</strong> Due Date: {due}</h5>);
      }
    return(<h5 className="panel-header">In Review Until: {deadline}, <strong>Email Due: {due}</strong></h5>)
    }
  return (<h5 className="panel-header">Changed State At: {date}</h5>);
}});

var AppHeaderMixin = {
  render_header(app, tools){
    var app = app || this.props.app,
        tools = tools ? <AppToolBar app={app} /> : null,
        stages = tools ? <MoveButton app={app} />: null,
        txt = user.get("can_moderate") ? <AppStatusMod app={app} /> : <AppStatusRev app={app} />,
        name = userName(app);
    return (
      <Grid>
        <Col xs={1}>
          <Gravatar forceDefault={!_.contains(DE_ANON_STAGES, app.get('stage'))} hash={app.get('gravatar')} size={40} />
        </Col>
        <Col xs={3} xs-offset={1}>
          <div className="panel-name">{name}</div>
          <HeaderIcons app={app} />
        </Col>
        <Col xs={3} xs-offset={4}>
          {txt}
        </Col>
         <Col xs={2} xs-offset={7}>
         {tools}
         </Col>
        <Col xs={2} xs-offset={9}>
         {stages}
        </Col>
      </Grid>
      );
  }
};



module.exports = {AppHeaderMixin: AppHeaderMixin,
                  HeaderTxtRev: HeaderTxtRev,
                  HeaderTxtMod: HeaderTxtMod};