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
  Button = rtbs.Button,
	ReactTransitionGroup = React.addons.TransitionGroup;



var Application = React.createClass({
  
  render: function() {
    var  fieldOne = this.props.app_data['fieldOne'],
          fieldTwo  = this.props.app_data['fieldTwo'];
          console.log(this.props.app_data['fieldTwo']);
    return (
        <div>
         <Input type="textarea" className="form-text" placeholder={fieldOne} label="Background" labelClassName="col-xs-2" 
                    wrapperClassName="col-xs-10" disabled ref="fieldOne"/>
        <Input type="textarea" className="form-text" placeholder={fieldTwo} label="Project" labelClassName="col-xs-2" 
                    wrapperClassName="col-xs-10" disabled ref="fieldOne"/>
        </div>
      
      );
  }
});

var FollowUpQuestions = React.createClass({
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


var ApproveQuestions = React.createClass({
  questionsApproved: function(questions) {
    //Do some e-mailing
  },

  render: function() {
    return (
      <div>
        <Input type='textarea' label="Questions:" labelClassName="col-xs-2" 
                      wrapperClassName="col-xs-10" 
                      defaultValue={this.props.questions} ref="questions" /> 
        <Button onSubmit={this.questionsApproved}>E-mail these questions</Button>
      </div>
      );}
  });

var ApplicationsList = React.createClass({

  render: function() {
    var input_one =  {'fieldOne': 'test2', 
               'fieldTwo': 'trying'},
        input_two = {'fieldOne': 'stage2', 
               'fieldTwo': 'trying2'},
        app = this.props.type === 'stage-1' ? input_one : input_two;
      

    return (
       <div className="applicationList">
        <Accordion>
          <Panel header="new">
            <Application app_data={app} />
            <FollowUpQuestions />
          </Panel>
           <Panel header="new">
            <Application app_data={app} />
            <ApproveQuestions questions="What is your project about?" />
          </Panel>
           <Panel header="new">
            <Application app_data={app} />
          </Panel>
        </Accordion>
        </div>
    );
  }
});


module.exports = ApplicationsList;