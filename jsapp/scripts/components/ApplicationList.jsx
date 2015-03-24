/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	rtbs  = require('react-bootstrap'),
  Modal = rtbs.Modal,
	Panel = rtbs.Panel,
  Input = rtbs.Input,
  Accordion = rtbs.Accordion,
  PanelGroup = rtbs.PanelGroup,
  OverlayMixin = rtbs.OverlayMixin,
  Button = rtbs.Button,
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
    return this["render_" + stage]();
  },


  render_review_reply:function() {
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
    var active = this.props.index === this.props.activeKey;
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'Send at: ';
    var hdr = (<h3>{hdr_str}<strong>{app.attributes.changedStageAt}</strong></h3>);
 
    return (
      <Panel header={hdr} bsStyle='danger' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
         <h4><strong>Anonymize Replies</strong></h4>
         <div dangerouslySetInnerHTML={{__html: content}} />
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} edit={false} />
        </div>
      </Panel>
      );
  },

  render_reply_received: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
    var active = this.props.index === this.props.activeKey;
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'Send at: ';
    var hdr = (<h3>{hdr_str}<strong>{app.attributes.changedStageAt}</strong></h3>);
 
    return (
      <Panel header={hdr} bsStyle='danger' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
         <h4><strong>Anonymize Replies</strong></h4>
         
          <EmailBox emails={app.get('emails')} app_id={app.get('id')} canEdit={true} />
        </div>
      </Panel>
      );
  },

  render_email_send: function(){
    var app = this.props.app;
    var content = markdown.toHTML(app.get('anon_content'));
    var active = this.props.index === this.props.activeKey;
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'Send at: ';
    var hdr = (<h3>{hdr_str}<strong>{app.attributes.changedStageAt}</strong></h3>);
 
    return (
      <Panel header={hdr} bsStyle='danger' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
         <h4><strong>Waiting for Replies</strong></h4>
          <div className="content-app" dangerouslySetInnerHTML={{__html: content}}>
          </div>
        </div>
      </Panel>
      );
  },


  render_in_review: function(){
    var app = this.props.app;
    var content  = markdown.toHTML(app.get('anon_content'));
    var fizzbuzz = app.get('fizzbuzz');
    var active = this.props.index === this.props.activeKey;
    var deadline = moment(app.attributes.changedStageAt).add(7, 'days').calendar();
    var style = (deadline > moment())? 'danger' : 'success';
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'DEADLINE: ';
    var hdr = (<h3>{hdr_str}<strong>{deadline}</strong></h3>);
    var email_button ="";
    
    if (user.attributes.can_moderate || user.attributes.can_admin){
      email_button = <EmailCreate app_id={app.get('id')} comments={app.getComments()} questions={app.getQuestions()}/>;
    }

    return (
      <Panel header={hdr} bsStyle={style} collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
          <h4><strong>Please Review Application</strong></h4>
          <div className="content-app" dangerouslySetInnerHTML={{__html: content}}></div>

          <h4><strong>Coding Challenge</strong></h4>
          <Highlight>
            {fizzbuzz}
          </Highlight>

          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
        </div>
        {email_button}
      </Panel>

      );
  },

  onSelect: function(evt) {
    this.props.onSelect(evt);
  },

  render_incoming:function() {
    var app = this.props.app;
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'Created: ';
    var active = this.props.index === this.props.activeKey;
    var date = moment(app.attributes.createdAt).calendar();
    var content = this.state.anon_content || this.props.app.attributes.anon_content;
    var hdr = (<h3>{hdr_str}<strong>{date}</strong></h3>);

    return (
       <Panel header={hdr} bsStyle='success' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
          <h4><strong>Edit the Anonymized Output:</strong></h4>
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
      </Panel>

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
                author = comment['author']['name'] ? comment['author']['name'] : 'unknown',
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
        content = markdown.toHTML(email['anon_content']),
        author = email['author']['name'] ? email['author']['name'] : 'unknown',
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
      content = email['content'];


      return (  
            <Input type='textarea' className="form-text"
                      defaultValue={content}
                      label="Anonymized Email"
                      labelClassName="col-xs-2"
                      wrapperClassName="col-xs-10"
                      ref="anon"/>
        );
    }
});

var EmailCreate = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function() {
    var comments = this.props.questions.concat(this.props.comments),

    comment_str = _.map(comments, function(comment){
            return (comment['content']);
          });

    var com_str = '';
    var i;
    for(i = 0; i < comment_str.length; i++){
      com_str = com_str + comment_str[i] + ' \n' ;
    }
      return {'isModalOpen': false, 'comments': com_str};
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
          <Button className="btn btn-primary btn-form" onClick={this.handleToggle}>Email Applicant</Button>
        );
    },

    renderOverlay: function() {
      if (!this.state.isModalOpen) {
        return <span/>;
      }else{
        return (
            <Modal title="Edit Questions to Send" onRequestHide={this.handleToggle}>
              <div>
                <textarea className="form-text" onChange={this.commentChanged} value={this.state.comments} labelClassName="col-xs-2" 
                        wrapperClassName="col-xs-10"/>
                <button className="btn btn-primary" onClick={this.sendEmail}>Send</button>
                <br />
              </div>
            </Modal>
          );
      }
    }
});

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
                <Application app={app} activeKey={self.state.activeKey} index={index}/>
                )
            })}
        </PanelGroup>
        </div>
    );
  }
});


module.exports = ApplicationsList;