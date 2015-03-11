/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	rtbs  = require('react-bootstrap'),
  _ = require('underscore'),
  Input = rtbs.Input;

var $=require('jquery');

var AddReviewer = React.createClass({

  submitForm: function(e){
    e.preventDefault();
    debugger;
    var name = this.refs.name.getValue().trim(),
          email = this.refs.email.getValue().trim(),
          admin = this.refs.admin.getValue().trim(),
          mod = this.refs.mod.getValue().trim(),
          role;
      if (admin){
        role = 'admin'
      }else if (mod){
        role='mod'
      }

      if (!name || !email) {
        console.log('ERROR SENDING')
        //SHOW A ERROR MESSAGE
          return;
      }else{
        var rev_object = {"name": name, "email": email, "role": role};
        var endpoint = "http://127.0.0.1:5000";
        var url = endpoint + "/reviewer/new";
        
         $.ajax({
          type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(rev_object),
          success: function(result) {
              this.refs.name.getValue().value = '';
              this.refs.email.getValue().value = '';       
            }
          });
         
      } 
      return;
  },

  render: function() { 
    return (
    <div className="main">
      <div className="container">
        <h3> Add A Reviewer </h3>
        <p>Reviewers will receive an email with username and login details</p>
        <form onSubmit={this.submitForm} className='form-horizontal'>
         <Input type="checkbox"
                   ref="mod" 
                   wrapperClassName="col-xs-offset-1 col-xs-10"
                   label="Is Moderator"/> 
         <Input type="checkbox"
                   ref="admin" 
                   wrapperClassName="col-xs-offset-1 col-xs-10"
                   label="Is Admin"/> 
         <Input type='text' label="Name:" labelClassName="col-xs-2" 
                      wrapperClassName="col-xs-8" 
                      placeholder="Reviewer's Name" ref="name" />
         <Input type='text' label="Email:" labelClassName="col-xs-2" 
                      wrapperClassName="col-xs-8" 
                      placeholder="Reviewer's Email" ref="email" />
          <button className="btn btn-primary btn-form" type="Post">Submit</button>
        </form>
        </div>
      </div>
    );
  }
});

module.exports = AddReviewer;
