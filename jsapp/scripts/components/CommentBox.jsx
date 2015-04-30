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
  {user} = require('../stores/UserStore');

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
      var self = this;

      return (
          <div className="commentBox">
           <h3>{this.props.hdr}:</h3>

          {_.map(comments, function(comment){
            var visible = comment.author.id === user.get('id'),
                app_id = self.props.appId;
              return <TwoWayEdit editComp={EditComment} displayComp={Comment} visible={visible} app_id={app_id} comment={comment} />
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

var Comment = React.createClass({
  render: function(){
    var comment = this.props.comment,
        content = comment['content'],
        author = <User user={comment.author} />,
        date = ' '+ comment['createdAt'],
        cssClass = comment.author.id === user.get('id') ? "comment-me" : "comment";

        return(
          <div className={cssClass}>
            <p>
            <strong>{content}</strong> <br />
            by: {author},
            {date}
            </p>
          </div>
    );
  }
});

var EditComment = React.createClass({

  submitComment: function(evt) {
    console.log('SUBMIT COMMENT');
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
          date = ' '+ comment['createdAt'],
          content = comment['content'];

      return (
        <div className="textBox">
            <Input type='textarea'
                      className="emailEdit"
                      defaultValue={content}
                      wrapperClassName="col-xs-12"
                      ref="comment"/>
            <p>
            <em> by: {author},{date}</em>
            <br />
            </p>
            <ButtonToolbar>
              <Button onClick={this.submitComment} bsStyle="success">Submit</Button>
              <Button onClick={this.cancelEdit} bsStyle="warning">Cancel</Button>
            </ButtonToolbar>
        </div>
        );
    }
})

module.exports = {CommentBox: CommentBox};