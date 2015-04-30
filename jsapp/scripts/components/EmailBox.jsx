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


var EmailBox = React.createClass({

  render: function() {
      var emails = this.props.emails,
          edit = this.props.canEdit,
          app_id = this.props.app_id,
          visible = user.attributes.can_moderate;

      return (
          <div className="commentBox">
           <h3>Emails:</h3>

          {_.map(emails, function(email, index){
              var ref = 'email' + index;
               return (<div className="emailBox">
               <TwoWayEdit editComp={EditEmail} displayComp={DisplayEmail} visible={visible} email={email} app_id={app_id}/>
               </div>)

             })}
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
            <em> by: {author},{date}</em>
            </p>
          </div>
        );
  }
});

var EditEmail = React.createClass({

submitEmail: function(evt) {
    console.log("POST EMAIL");

    var content = this.refs.anon.getValue();
    var emails = {};

    emails[this.props.email['id']] = content;
    Action.anonymizeEmails({appId: this.props.app_id, content: emails});

    this.cancelEdit(evt);
  },

  cancelEdit: function(evt) {
    this.props.cancelEdit();
  },

  getContent: function() {
    return this.refs.anon.getValue();

  },
  render: function() {
      var email = this.props.email,
          author = <User user={email.author} />,
          date = ' '+ email['createdAt'],
          anon_content = email['anon_content'] || '',
          content = email['content'] || '',
          display_content = User.can_admin && !anon_content ? content : anon_content;

      return (
        <div className="textBox">
            <Input type='textarea'
                      className="emailEdit"
                      defaultValue={display_content}
                      wrapperClassName="col-xs-12"
                      ref="anon"/>
            <p>
            <em> by: {author},{date}</em>
            <br />
            </p>
            <ButtonToolbar>
              <Button onClick={this.submitEmail} bsStyle="success">Submit</Button>
              <Button onClick={this.cancelEdit} bsStyle="warning">Cancel</Button>
            </ButtonToolbar>
        </div>
        );
    }
});

module.exports = {EmailBox: EmailBox};