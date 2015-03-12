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
  moment = require('moment');



var Application = React.createClass({
  
  render: function() {
    var stage = this.props.app.get("stage");
    return this["render_" + stage]();
  },

  render_email_send: function(){
    var  content  = this.props.app.get('anon_content');
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
          </div>
          <Questions />
        </div>
      </Panel>
      
      );
  },
  
  onSelect: function(evt) {
    this.props.onSelect(evt);
  },

  render_incoming:function() {
    var app = this.props.app;
    var  content  = app.get('anon_content');
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
            <textarea className="form-text" value={content} label="Anonymized" labelClassName="col-xs-2" 
                    wrapperClassName="col-xs-10" ref="anon"/>
          </form>
          <Button>Submit and move to next stage</Button>
        </div>
      </Panel>
      
      );
  }
});

var Questions = React.createClass({
  render: function() {
    return (
        <form>
         <Input type='textarea' label="Questions:" labelClassName="col-xs-2" 
                      wrapperClassName="col-xs-10" 
                      placeholder="Enter Follow Up Questions" ref="questions" /> 
          
          <button className="btn btn-primary btn-form" type="submit">Save</button>
      </form>
      
      );
  }
});

var CommentBox = React.createClass({

render: function() {
    comments = this.props.comments;

    return (
        <div className="comment_box">

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