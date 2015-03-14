/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	rtbs  = require('react-bootstrap'),
	Panel = rtbs.Panel,
  Input = rtbs.Input,
  Accordion = rtbs.Accordion,
  PanelGroup = rtbs.PanelGroup,
  Button = rtbs.Button,
	ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  Action = require('../actions/actions'),
  moment = require('moment');

var $=require('jquery');

var Application = React.createClass({

  componentDidMount: function(){
    var self = this;
    this.props.app.on("all", function(){
      self.forceUpdate();
    });

  },

  moveToReview: function(){
    console.log('to review:', this.props.app.get('id'))
     Action.moveToReview({appId: this.props.app.get('id'), anon_content: this.state.anon_content});
  },

  getInitialState: function(){
    return {'anon_content': this.props.app.get('anon_content')};
  },

  contentChanged: function(event) {
    this.setState({anon_content: event.target.value});
  },
  
  render: function() {
    var stage = this.props.app.get("stage");
    return this["render_" + stage]();
  },

  render_email_send: function(){
    var app = this.props.app;
    var  content  = app.get('anon_content');
    var active = this.props.index === this.props.activeKey;
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'Send at: ';
    var hdr = (<h3>{hdr_str}<strong>{app.attributes.changedStageAt}</strong></h3>);
    
    return (
      <Panel header={hdr} bsStyle='danger' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
         <h4><strong>Waiting for Replies</strong></h4>
          <div className="content-app">
          {content}
          </div>
        </div>   
      </Panel>   
      );
  },

  render_in_review: function(){
    var app = this.props.app;
    var content  = app.get('anon_content');
    var fizzbuzz = app.get('fizzbuzz');
    var active = this.props.index === this.props.activeKey;
    var deadline = moment(app.attributes.changedStageAt).add(7, 'days').calendar();
    var style = (deadline > moment())? 'danger' : 'success';
    var hdr_str = app.attributes['batch'] + ' #' + app.attributes.id + ' ' + 'DEADLINE: ';
    var hdr = (<h3>{hdr_str}<strong>{deadline}</strong></h3>);
        
    return (
      <Panel header={hdr} bsStyle={style} collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
          <h4><strong>Please Review</strong></h4>
          <div className="content-app">
          {content}
          <br />
          <br />
          {fizzbuzz}
          </div>

          <CommentBox comments={app.getQuestions()} question={true} appId={app.get('id')} hdr="Questions to applicants" place="Ask Question"/>
          <CommentBox comments={app.getComments()} appId={app.get('id')} hdr="Comments" place="Add Comment" />
        </div>
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
    var hdr = (<h3>{hdr_str}<strong>{date}</strong></h3>);
    
    return (
       <Panel header={hdr} bsStyle='success' collapsable={true} expanded={active} eventKey={this.props.index} onSelect={this.onSelect}>
        <div>
          <h4><strong>Edit the Anonymized Output:</strong></h4>
          <div className="content-app">
          </div>
          <form>
            <textarea className="form-text" value={this.state.anon_content} onChange={this.contentChanged} label="Anonymized" labelClassName="col-xs-2" 
                    wrapperClassName="col-xs-10" ref="anon"/>
          </form>
          <Button onClick={this.moveToReview}>Submit and move to next stage</Button>
        </div>
      </Panel>
      
      );
  }
});


var CommentBox = React.createClass({

  postComment: function() {
    console.log(this.props.appId);

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
    return {'comment': ''};
  },

  commentChanged: function(event) {
    this.setState({comment: event.target.value});
  },

  render: function() {
    console.log('COMMENTS', comments);
      var comments = this.props.comments ? this.props.comments : "";

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
                        placeholder={this.props.place} onChange={this.commentChanged} ref="comment" /> 
            
            <button className="btn btn-primary btn-form" type="submit" onClick={this.postComment}>Add</button>
        </form>
          </div>
        );
    }
});



var EmailCreate = React.createClass({
 render: function() {
    var questions = this.props.questions;
    var questionString;
    for (q in questions){
      questionString = questionString + ' ' + q;
    }

    return (
        <div>
        <textarea> {questionString} </textarea>
        </div>
      
      );
  }
});

var ApplicationsList = React.createClass({

  getInitialState: function(){
    return {'activeKey': 0};
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
        <PanelGroup activeKey={this.state.activeKey}  onSelect={self.handleSelect} accordion>
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