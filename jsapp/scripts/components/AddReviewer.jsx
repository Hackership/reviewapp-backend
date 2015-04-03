/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	{Input, Grid, Row, Col, Button} = require('react-bootstrap'),
  _ = require('underscore'),
  $ = require('jquery');

var AddReviewer = React.createClass({

  submitForm: function(e){
    e.preventDefault();

    var roles = [];

    if (this.refs.admin.getChecked()){
      roles.push('admin');
    } else if (this.refs.moderator.getChecked()){
      roles.push('moderator');
    } else if (this.refs.reviewer.getChecked()) {
      roles.push('reviewer');
    }

    if (this.refs.skypelead.getChecked()){
      roles.push('skypelead');
    } else if (this.refs.skypee.getChecked()){
      roles.push('skypee');
    }

    if (!(this.state.name.length => 3) || !(this.state.email.length > 6)) {
      alert("Name or Email is empty!")
      return;
    } else {
      var rev_object = {"name": this.state.name,
                        "email": this.state.email,
                        "roles": roles};
      var url = "/reviewer/new";

       $.ajax({
          type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(rev_object),
        }).done(function( msg ) {
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

          <Row>
           <Input type='text' label="Name:" labelClassName="col-xs-2"
                        wrapperClassName="col-xs-8"
                        placeholder="Reviewer's Name" value={name} onChange={this.changeName} ref="name" />
           <Input type='text' label="Email:" labelClassName="col-xs-2"
                      wrapperClassName="col-xs-8"
                      placeholder="Reviewer's Email" value={email} onChange={this.changeEmail} ref="email" />
          </Row>

          <Row>
            <Col xs={4} xsOffset={2}>
             <Input type='checkbox' ref='reviewer' label="is Reviewer" defaultChecked={true} />
             <Input type='checkbox' ref='moderator' label="is Moderator" />
             <Input type='checkbox' ref='admin' label="is Admin" />
            </Col>
            <Col xs={4}>
             <Input type='radio' wrapperClassName='' ref='noSkype' label="doesn't do skype" defaultChecked={true}  name='skype' />
             <Input type='radio' wrapperClassName='' ref='skypee' label="is skypee" name='skype' />
             <Input type='radio' wrapperClassName='' ref='skypelead' label="is skype lead" name='skype' />
            </Col>
          </Row>
          <button bsStyle="success" className="btn" type="Post">Submit</button>
        </form>
        </div>
      </div>
    );
  }
});

module.exports = AddReviewer;
