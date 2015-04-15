/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	{Modal, Panel, Input, Well, Col, Row, Grid, Glyphicon, Accordion, PanelGroup, OverlayMixin, Button}  = require('react-bootstrap'),
  {User, Gravatar} = require("./User"),
	ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  Action = require('../actions/actions'),
  markdown = require( "markdown" ).markdown,
  Highlight = require('react-highlight'),
  moment = require('moment');

var $=require('jquery');

var Application = React.createClass({

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

  render: function() {
    var stage = this.props.app.get("stage");
    var active = this.props.index === this.props.activeKey;
    var dropOut = user.attributes.can_admin ?  <DropOutButton app={this.props.app}/> : "";
    
    return (<Panel header={this.render_header()} bsStyle='info' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        {this["render_" + stage]()}
        {dropOut}
      </Panel>);
  },

  render_header: function(app){
    var app = this.props.app,
        txt = user.attributes.can_moderate ? <HeaderTxtMod app={app} /> : <HeaderTxtRev app={app} />
    return (
      <Grid>
      <Col xs={1}>
        <Gravatar forceDefault={true} hash={app.get('gravatar')} size={40} /> 
      </Col>
      <Col xs={3} xs-offset={1}>
        <div className="panel-name">{app.attributes.anon_name}</div>
        <HeaderIcons app={app} />
      </Col>
      <Col xs={8} xs-offset={4}>
        {txt}
      </Col>
      </Grid>
      );
  },

  render_skype_scheduled: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));

    return (<div>
          <Instruction instruction="Skype Scheduled. Please leave comments for the interviewers" />
          <div dangerouslySetInnerHTML={{__html: content}} />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
        </div>
      );
  },

  render_schedule_skype: function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));

    return (<div>
          <Instruction instruction="Skype Invitation Stage. The applicant has received an e-mail to schedule a Skype call. If needed: add additional comments and questions below!" />
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
 
    return (
        <div>
          <Instruction instruction="Email Review Stage. Please review the applicant's email answers to our questions. Add any comments or further questions you have in the boxes below!" />
         <div dangerouslySetInnerHTML={{__html: content}} />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
          <SkypeScheduleButton app={app} user={user} />
        </div>
      );
  },

  render_reply_received: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
 
    return (
        <div>
          <Instruction instruction="Email Anonymization Stage. Please anonymize replies by removing names, emails and other identifiers." />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} canEdit={true} />
        </div>
      );
  },

  render_email_send: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content') || '');

    return (
      <div>
        <Instruction instruction="Email Send. No Action Required." />
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
          <Instruction instruction="Review Stage. Please read through this application and add questions for the applicant in the box below." />
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
         <Instruction instruction="Anonymization Stage. Please Anonymize this application by removing names and other identifiers" />
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
          <Button onClick={this.moveToReview}>Submit and move to next stage</Button>
        </div>
     
      );
  }
});


var CommentBox = React.createClass({

  postComment: function() {

    if (this.props.question) {
      Action.postComment({appId: this.props.appId, comment: this.state.comment, question: '1'});
      this.setState({comment: ''});
    }
    else{
      Action.postComment({appId: this.props.appId, comment: this.state.comment});
      this.setState({comment: ''});
    }
  },

  getInitialState: function(){
    return {};
  },

  commentChanged: function(event) {
    this.setState({comment: event.target.value});
  },

  render: function() {
      var comments = this.props.comments ? this.props.comments : "";
      var new_comment = this.state.comment ? this.state.comment : "";

      return (
          <div className="commentBox">
           <h3>{this.props.hdr}:</h3>

          {_.map(comments, function(comment){
            var content = comment['content'],
                author = <User user={comment.author} />,
                date = ' '+ comment['createdAt'];

                return(
                  <div className="comment">
                    <p>
                    <strong>{content}</strong> <br />
                    by: {author},
                    {date}
                    </p>
                  </div>
                  )
              })}
              <form>
            <Input type='textarea'
                  wrapperClassName="col-xs-9"
                  placeholder={this.props.place}
                  onChange={this.commentChanged}
                  value={new_comment}
                  ref="comment" />
            <button className="btn btn-primary btn-form"
                    type="submit"
                    onClick={this.postComment}>Add</button>
        </form>
          </div>
        );
    }
});

var EmailBox = React.createClass({
  
  submitEmails: function() {
    var index;
    var emails = {};
    var email;
    for (index=0; index < this.props.emails.length; index++){
      content = this.refs["email"+index].getContent();
      email = this.props.emails[index];
      emails[email['id']] = content;
      console.log(emails);
    }
    Action.moveToEmailReview({appId: this.props.app_id, content: emails});
  },

  render: function() {
      var emails = this.props.emails;
      var edit = this.props.canEdit;
      var submit = edit ? <Button onClick={this.submitEmails}>Submit</Button> : ""; 

      return (
          <div className="commentBox">
           <h3>Emails:</h3>

          {_.map(emails, function(email, index){
              var ref = 'email' + index;
                
                if (edit) {
                return(<SingleEmail email={email} ref={ref}/>)
                }

                else {
                  return (<DisplayEmail email={email} />)
                }
                  
              })}
          {submit}
          </div>
        );
    }
});

var DisplayEmail = React.createClass({
  
  render: function() {

    var email = this.props.email,
        content = markdown.toHTML(email['anon_content'] || ''),
        author = <User user={email.author} />,
        date = ' '+ email['createdAt'],
        incoming = email['incoming'] ? 'incoming' : 'comment';

    return (
        <div className={incoming}>
            <div  dangerouslySetInnerHTML={{__html: content}}>
            </div>
            <p>
            by: {author},
            {date}
            </p>
          </div>
        );
  }
});

var SingleEmail = React.createClass({

  getContent: function() {
    return this.refs.anon.getValue();

},
  render: function() {
      var email = this.props.email,
      content = email['incoming'] ? email['content'] : email['anon_content'];


      return (  
            <Input type='textarea' className="email"
                      defaultValue={content}
                      wrapperClassName="col-xs-12"
                      ref="anon"/>
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
          <Button className="btn" bsStyle="success" onClick={this.handleToggle}>Email Applicant</Button>
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

var DropOutButton = React.createClass({
    
  dropApplication: function(){
    if (window.confirm("Do you really want to set this application to inactive?")) { 
      Action.dropApplication({appId: this.props.app.attributes.id});
    }
    
  },
  render: function() {
    return (
      <Button bsStyle="link" onClick={this.dropApplication}>Applicant Dropped Out</Button>  
      );
  }

});

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
    var text = in_rev? 'Due: ':'Stage Changed: ';
    var deadline = in_rev? moment(app.attributes.changedStageAt).add(7, 'days').calendar() : moment(app.attributes.changedStageAt).calendar();
    return (
      <h5 className="panel-header"><strong>{text}{deadline}</strong></h5>
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
            return(<h5 className="panel-header urgent"><strong>Ready For E-mail<br />Due Date: {due}</strong></h5>);
        }
        return(<h5 className="panel-header urgent"><strong>Urgent, Due Date: {due} </strong></h5>);
      }

      return(<h5 className="panel-header">In Review Until: {deadline}, <strong>Email Due: {due}</strong></h5>)
    }

    return (<h5 className="panel-header">Changed State At: {date}</h5>);
}});

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
        <PanelGroup activeKey={this.state.activeKey} onSelect={self.handleSelect} accordion>
        {_.map(apps, function(app, index){
              return(
                <Application app={app} activeKey={self.state.activeKey} index={index} />
                )
            })}
        </PanelGroup>
        </div>
    );
  }
});


module.exports = {ApplicationList: ApplicationsList, Application: Application};