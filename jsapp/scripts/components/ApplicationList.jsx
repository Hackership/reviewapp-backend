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
  Highlight = require('react-highlight'),
  {EmailBox} = require('./EmailBox'),
  {applications, getInstructionForStage} = require('../stores/ApplicationStore'),
  {AppHeaderMixin, ApplicationListHeader, HeaderTxtRev, HeaderTxtMod} = require('./AppHeader'),
  {AppToolBar} = require('./AppToolBar'),
  {CommentBox} = require('./CommentBox'),
  moment = require('moment');

var $=require('jquery');

var Application = React.createClass({
  mixins: [AppHeaderMixin],

  componentDidMount: function(){
    var self = this;
    this.props.app.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

  },

  moveToReview: function(){
     Action.moveToReview({appId: this.props.app.get('id'), anon_content: this.state.anon_content});
  },

  getInitialState: function(){
    return {};
  },

  contentChanged: function(event) {
    this.setState({anon_content: event.target.value});
  },

  emailChanged: function(event) {
     this.setState({email_content: event.target.value});
  },

  moveToEmailReview: function(event){

     var has_content = _.every(this.props.app.get('emails'), function(email) {return email.anon_content});
     if (has_content){
        Action.moveToEmailReview({appId: this.props.app.get('id')});
     }else{
      alert("Please anonymize all emails");
      }
  },

  render: function() {
    var app = this.props.app;
    var txt = user.get("can_moderate") ? <HeaderTxtMod app={app} /> : <HeaderTxtRev app={app} />
    var stage = this.props.app.get("stage");
    var active = this.props.index === this.props.activeKey;
    var instruction = getInstructionForStage(app.get('stage'));

    return (<div>
        <div className="panel-background">
        {this.render_header(app, true)}
        </div>
        <Instruction instruction={instruction} />
        <MetaInfo app={app} />
        {this["render_" + stage]()}
      </div>);
  },

  render_skyped: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));

    return (<div>
          <div dangerouslySetInnerHTML={{__html: content}} />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
        </div>
      );
  },

  render_skype_scheduled: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
    var fizzbuzz = app.get('fizzbuzz');

    return (<div>
          <div dangerouslySetInnerHTML={{__html: content}} />
          <Highlight>
            {fizzbuzz}
          </Highlight>
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
          <SkypedButton app={app} user={user}/>
        </div>
      );
  },

  render_schedule_skype: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));

    return (<div>
          <div dangerouslySetInnerHTML={{__html: content}} />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
        </div>
      );
    },

  render_review_reply: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
    var fizzbuzz = app.get('fizzbuzz');

    return (
        <div>
          <SkypeScheduleButton app={app} user={user} />
          <div dangerouslySetInnerHTML={{__html: content}} />
          <h4><strong>Coding Challenge</strong></h4>
          <Highlight>
            {fizzbuzz}
          </Highlight>
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
        </div>
      );
  },

  render_reply_received: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));

    return (
        <div>
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} canEdit={true} />
          <Button bsStyle="success" onClick={this.moveToEmailReview}> Move to next stage </Button>
        </div>
      );
  },

  render_email_send: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content') || '');

    return (
      <div>
          <div className="content-app" dangerouslySetInnerHTML={{__html: content}}>
          </div>
            <EmailBox emails={app.get('emails')} app_id={app.get('id')} canEdit={false} />
        </div>
      );
  },


  render_in_review: function(){
    var app = this.props.app;
    var content  = markdown.toHTML(app.get('anon_content'));
    var fizzbuzz = app.get('fizzbuzz');
    var email_button ="";

    if (user.attributes.can_moderate || user.attributes.can_admin){
      email_button = <EmailCreate app_id={app.get('id')} comments={app.getComments()} questions={app.getQuestions()}/>;
    }

    return (
      <div>
          <div className="content-app" dangerouslySetInnerHTML={{__html: content}}></div>

          <h4><strong>Coding Challenge</strong></h4>
          <Highlight>
            {fizzbuzz}
          </Highlight>

          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          {email_button}
        </div>
      );
  },

  onSelect: function(evt) {
    this.props.onSelect(evt);
  },

  render_incoming:function() {
    var app = this.props.app;
    var active = this.props.index === this.props.activeKey;
    var content = this.state.anon_content || this.props.app.attributes.anon_content;

    return (
       <div>
          <div className="content-app">
          </div>
          <form>
            <textarea className="form-text"
                      value={content}
                      onChange={this.contentChanged}
                      label="Anonymized"
                      labelClassName="col-xs-2"
                      wrapperClassName="col-xs-10"
                      ref="anon"/>
          </form>
          <Button wrapperClassName="col-xs-8" bsStyle="success" onClick={this.moveToReview}>Submit and move to next stage</Button>
        </div>

      );
  }
});


var Instruction = React.createClass({

  render: function() {
        var text = this.props.instruction;

      return (
        <Well className="instruction">
          <h4>What to do with this application:</h4>
          <p>{text}</p>
        </Well>);
    }
});

var EmailCreate = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function() {
    var comments = this.props.questions.concat(this.props.comments),
        com_str = this.getComments(comments);

      return {'isModalOpen': false, 'comments': com_str};
    },

  getComments: function(comments){

    var comment_str = _.map(comments, function(comment){
            return (comment['content']);
          });

    var com_str = '';
    var i;
    for(i = 0; i < comment_str.length; i++){
      com_str = com_str + comment_str[i] + ' \n' ;
    }

    return (com_str);
  },

  componentWillReceiveProps: function(props) {
    var com_str = this.getComments(props.questions);
    this.setState({
      comments: com_str
    });
  },
  commentChanged: function(evt){
      this.setState({
        comments: evt.target.value
      });
    },

  handleToggle: function(evt) {
      this.setState({
        isModalOpen: !this.state.isModalOpen
      });
    },

    sendEmail: function(evt) {
      Action.sendEmail({email: this.state.comments, appId: this.props.app_id});
      this.setState({
        isModalOpen: !this.state.isModalOpen
      });
    },

   render: function() {
      return (
          <Button className="btn" bsStyle="info" onClick={this.handleToggle}>Email Applicant</Button>
        );
    },

    renderOverlay: function() {
      if (!this.state.isModalOpen) {
        return <span/>;
      }else
      {
        return (
            <Modal title="Edit Questions to Send" onRequestHide={this.handleToggle}>
              <div>
                <textarea className="popup" onChange={this.commentChanged} value={this.state.comments} labelClassName="col-xs-2"
                        wrapperClassName="col-xs-10"/>
                <button className="btn btn-primary" onClick={this.sendEmail}>Send</button>
                <br />
              </div>
            </Modal>
          );
      }
    }
});

var SkypeScheduleButton = React.createClass({

  render: function() {
    var inactive = (this.props.app.attributes.stage === 'review_reply') ? false : true,
        visible = (this.props.user.attributes.can_admin || this.props.user.attributes.can_moderate) ? true : false,
        app_id = this.props.app.attributes.id;

    if (visible){
      return (
        <Button disabled={inactive} onClick={this.scheduleSkype} bsStyle='info' className="btn-form">Schedule Skype</Button>
        );
    }

    return (<div></div>);

  },

  scheduleSkype: function() {
     Action.moveToScheduleSkype({appId: this.props.app.attributes.id});
  }
});

var SkypedButton = React.createClass({
  render: function() {
      var inactive = (this.props.app.attributes.stage === 'skype_scheduled') ? false : true,
          visible = (this.props.user.attributes.can_admin || this.props.user.attributes.can_moderate) ? true : false,
          app_id = this.props.app.attributes.id;

      if (visible){
        return (
          <Button disabled={inactive} onClick={this.skyped} bsStyle='info' className="btn-form">Move to Skyped</Button>
          );
      }

      return (<div></div>);

  },

  skyped: function() {
    Action.moveToSkyped({appId: this.props.app.attributes.id});
  }
});



var MetaInfo = React.createClass({
  render: function() {
    var app = this.props.app,
        skype_info = app.get('stage')==='skype_scheduled' ? <SkypeInfo app={app} /> : <div />,
        batch = app.get('batch') ? app.get('batch'): "No value",
        member_string = (app.get('members').length > 0) ? _.map(app.get('members'), member => member.name).join(', ') : "None";


    return (
      <div className="meta">
      <Row>
        <Col xs={12} xs-offset={0}>
      <h5><strong>GENERAL INFO</strong></h5>
      <p><strong>Reviewers: </strong>{member_string}</p>
      <p><strong>Batch: </strong> {batch}</p>
        </Col>
      </Row>
      <Row>
      {skype_info}
     </Row>
      </div>
    );
  }
});

var SkypeInfo = React.createClass({
  render: function() {
    var app = this.props.app,
        name = app.get('name') ? app.get('name'): "No value",
        grant = app.get('grant') ? app.get('grant') : "No",
        calls = _.map(app.get('calls'), call => <SkypeCall call={call} />);

    return (
      <div>
      <Col xs={4} xs-offset={0}>
      <h5><strong>SKYPE INFO</strong></h5>
      <p><strong>Name: </strong> {name}</p>
      <p><strong>Grant applicant: </strong>{grant}</p>
      <br />
      </Col>
      {calls}
      </div>
      );
  }
});

var SkypeCall = React.createClass({
  render: function() {
    var call = this.props.call,
        skype_name = call.skype_name,
        zone = user.get('timezone'),
        date = moment.tz(call.scheduledAt, zone).format("DD/MM/YYYY hh:mm"),
        callers_string = (call.callers.length > 0) ? _.map(call.callers, caller => caller.name).join(', ') : "None";
  return (
    <Col xs={4} xs-offset={4}>
      <h5><strong>CALLS</strong></h5>
      <p><strong>Time: </strong>{date}</p>
      <p><strong>Skype Name: </strong>{skype_name}</p>
      <p><strong>Callers: </strong>{callers_string}</p>
    </Col>
    );
  }
})

var ApplicationsList = React.createClass({

  getInitialState: function(){
    return {};
  },

  handleSelect: function(selectedKey) {
    this.setState({'activeKey': selectedKey});
  },

  render: function() {
    var apps = this.props.apps;

    var app = apps[0],
        self = this;

    return (
       <div className="applicationList">
        <ul className="panel-group">
        {_.map(apps, (app, index) =>
          <ApplicationListHeader app={app} />
        )}
        </ul>
      </div>
    );
  }
});


var AppPage = React.createClass({
  render(){
    var app = applications.get(parseInt(this.props.params.appId));
    return  (
      <div className="main">
        <div className="main-container">
          <Application app={app} />
        </div>
      </div>
      );
  }
})


module.exports = {ApplicationList: ApplicationsList,
                  ApplicationPage: AppPage,
                  Application: Application};
