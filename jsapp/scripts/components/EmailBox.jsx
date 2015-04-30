/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Nav, Button, Input} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  markdown = require( "markdown" ).markdown,
  {User, Gravatar} = require("./User"),
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

module.exports = {EmailBox: EmailBox};