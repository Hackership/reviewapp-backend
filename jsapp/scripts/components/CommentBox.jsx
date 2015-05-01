/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Nav, Button, Input, Gravatar, ButtonToolbar} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  markdown = require( "markdown" ).markdown,
  {User, Gravatar} = require("./User"),
  {TwoWayEdit} = require("./TwoWayEdit"),
  Action = require('../actions/actions'),
  moment = require('moment'),
  {user} = require('../stores/UserStore');

var CommentBox = React.createClass({

  postComment: function(evt) {
    evt.preventDefault();

    if (this.props.question) {
      Action.postComment({appId: this.props.appId, comment: this.state.comment, question: '1'});
      this.setState({comment: ''});
    } else {
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
      var comments = this.props.comments ? _.sortBy(this.props.comments, 'createdAt').reverse(): "";
      var new_comment = this.state.comment ? this.state.comment : "";
      var self = this;

      return (
          <div className="commentBox">
           <h3>{this.props.hdr}:</h3>

          {_.map(comments, function(comment){
            var visible = comment.author.id === user.get('id'),
                app_id = self.props.appId;
              return <TwoWayEdit key={comment.id} editComp={EditComment} displayComp={Comment} stage={self.props.stage} visible={visible} app_id={app_id} comment={comment} />
              })}
          <Input type='textarea'
                wrapperClassName="col-xs-9"
                placeholder={this.props.place}
                onChange={this.commentChanged}
                value={new_comment}
                ref="comment" />
          <button className="btn btn-primary btn-form"
                  onClick={this.postComment}>Add</button>
          </div>
        );
    }
});

var Comment = React.createClass({
  render: function(){
    var comment = this.props.comment,
        content = comment['content'],
        author = <User user={comment.author} />,
        date = ' '+ moment(comment['createdAt']).calendar(),
        cssClass = this.props.stage === comment['stage'] ? 'bold-comment' : 'comment';

        return(
          <div className={cssClass}>
            <p>
            {content}<br /></p>
            <p><em>{author}, {date}</em>
            </p>
          </div>
    );
  }
});

var EditComment = React.createClass({

  submitComment: function(evt) {
    var content = this.refs.comment.getValue();
    var appId = this.props.app_id;
    Action.editComment({comment_id: this.props.comment['id'], appId: appId, comment: content});
    this.cancelEdit(evt);
  },

  cancelEdit: function(evt) {
    this.props.cancelEdit();
  },

  getContent: function() {
    return this.refs.comment.getValue();

  },
  render: function() {
      var comment = this.props.comment,
          author = <User user={comment.author} />,
          date = ' '+ ' '+ moment(comment['createdAt']).calendar(),
          content = comment['content'];

      return (
        <div className="textBox">
            <Input type='textarea'
                      className="emailEdit"
                      defaultValue={content}
                      wrapperClassName="col-xs-12"
                      ref="comment"/>
            <ButtonToolbar>
              <Button onClick={this.submitComment} bsStyle="success">Submit</Button>
              <Button onClick={this.cancelEdit} bsStyle="warning">Cancel</Button>
            </ButtonToolbar>
        </div>
        );
    }
})

module.exports = {CommentBox: CommentBox};