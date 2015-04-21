/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	{Nav} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  FocusList = require('./FocusMode'),
  {user} = require('../stores/UserStore');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var AppsList = React.createClass({
    render() {
      var app_list = applications.byStage(this.props.params.stage);
      return <ApplicationList apps={app_list} />
    }
});

function availableStages() {
  var stages = [
    {key: 'in_review', title: 'To Review'},
    {key: 'email_send', title: 'Emailed'},
    {key: 'review_reply', title: 'Review Reply'},
    {key: 'schedule_skype', title: 'Skype Invite Send'},
    {key: 'skype_scheduled', title: 'Skype Scheduled'},
    {key: 'skyped', title: 'Skyped'}
    ];

  if (user.attributes.can_admin) {
      stages.splice(0, 0, {key: 'incoming', title: "Incoming"});
  }

  if (user.attributes.can_moderate) {
      stages.splice(3,0, {key: 'reply_received', title: "Reply Incoming"});
  }

  return stages;
}

var StagesView = React.createClass({

  statics: {
    willTransitionTo: function (transition, params) {
      console.log(params);
      if (params.stage) return;

      var stageCounts = applications.stageCounts(),
          stages = availableStages(),
          stage = (_.find(stages, function(stage){
                          return stageCounts[stage.key];
                        }) || stages[0]).key;
      transition.redirect("appStage", {stage: stage});
    }
  },

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render() {
    var stages = availableStages(),
        stageCounts = applications.stageCounts(),
        activeStage = this.props.params.stage;

    return (
      <div className="main">
        <div className="main-container">
    	   <Nav className="tabPanel">
          <ul className="tabPanel nav nav-tabs">
            {_.map(stages, (stage, index) =>
              <li className={stage.key === activeStage? "active" : ""} eventKey={stage.key}>
                <Link to="appStage" params={{stage: stage.key}}>{stage.title + ' ('+ (stageCounts[stage.key] || 0) + ')'}</Link>
              </li>
            )}
          </ul>
        </Nav>
        <RouteHandler {...this.props}/>
        </div>
      </div>
    );
  }
});

var FocusReview = React.createClass({

  componentDidMount() {
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render() {
    var apps;

    if (user.attributes.can_admin) {
      apps = applications.byUrgency('admin');
    } else if (user.attributes.can_moderate) {
       apps = applications.byUrgency('moderator');
    } else {
       apps = applications.byUrgency('reviewer');
    }

    return (
      <div className="main">
        <div className="main-container">
         <FocusList apps={apps} />
        </div>
      </div>
    );
  }
});

module.exports = {StagesView: StagesView,
                  AppsList: AppsList,
                  FocusReview: FocusReview};
