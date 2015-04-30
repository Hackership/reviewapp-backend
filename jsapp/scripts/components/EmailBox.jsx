/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Nav, Button, Input, Gravatar} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  markdown = require( "markdown" ).markdown,
  {User, Gravatar} = require("./User"),
  {TwoWayEdit} = require("./TwoWayEdit"),
  {user} = require('../stores/UserStore');


var EmailBox = React.createClass({

  submitEmails: function() {
    var index;
    var emails = {};
    var email;
    for (index=0; index < this.props.emails.length; index++){
      content = this.refs["email"+index].getContent();
      email = this.props.emails[index];
      emails[email['id']] = content;
    }

    if (!this.props.stage || !this.props.stage === "reply_received"){
       Action.anonymizeEmails({appId: this.props.app_id, content: emails});
    }else{
       Action.moveToEmailReview({appId: this.props.app_id, content: emails});
    }
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

               return <TwoWayEdit editComp={EditEmail} displayComp={DisplayEmail} email={email} /> 

             })}
          {submit}
          </div>
        );
    }
  }
)


var DisplayEmail = React.createClass({

  render: function() {

    var email = this.props.email,
        anon_content = markdown.toHTML(email['anon_content'] || ''),
        content = markdown.toHTML(email['content'] || ''),
        display_content = User.can_admin && !anon_content ? content : anon_content,
        author = <User user={email.author} />,
        date = ' '+ email['createdAt'],
        incoming = email['incoming'] ? 'incoming' : 'outgoing';

    return (
      <div className={incoming}>
            <div  dangerouslySetInnerHTML={{__html: display_content}}>
            </div>
            <p>
            by: {author},
            {date}
            </p>
          </div>
        );
  }
});

var EditEmail = React.createClass({

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

module.exports = {EmailBox: EmailBox};