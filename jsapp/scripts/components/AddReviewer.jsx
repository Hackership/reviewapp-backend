/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	{Input}  = require('react-bootstrap'),
  _ = require('underscore');

var $=require('jquery');

var AddReviewer = React.createClass({

  submitForm: function(e){
    e.preventDefault();
    debugger;
    var   admin = this.refs.admin.getValue().trim(),
          mod = this.refs.mod.getValue().trim(),
          role;
      
      if (admin){
        role = 'admin'
      }else if (mod){
        role='mod'
      }

      if (!(this.state.name.length > 3) || !(this.state.email.length > 6)) {
        console.log('ERROR SENDING')
           alert("Name or Email is empty!")
          return;
      }else{
        var rev_object = {"name": this.state.name, "email": this.state.email, "role": role};
        var url = "/reviewer/new";
        
         $.ajax({
          type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(rev_object),
          }) .done(function( msg ) {
            alert( "Reviewer Added: " + msg );
          });
         
      } 

      this.setState({name:'', email:''});
      return;
  },
  getInitialState: function() {
    return {name: '', email: ''};
  },
  changeName: function(event) {
    this.setState({name: event.target.value});
  },
  changeEmail: function(event) {
    this.setState({email: event.target.value});
  },

  render: function() { 
    var name = this.state.name,
        email = this.state.email;

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
                      placeholder="Reviewer's Name" value={name} onChange={this.changeName} ref="name" />
         <Input type='text' label="Email:" labelClassName="col-xs-2" 
                      wrapperClassName="col-xs-8" 
                      placeholder="Reviewer's Email" value={email} onChange={this.changeEmail} ref="email" />
          <button bsStyle="success" className="btn" type="Post">Submit</button>
        </form>
        </div>
      </div>
    );
  }
});

module.exports = AddReviewer;
