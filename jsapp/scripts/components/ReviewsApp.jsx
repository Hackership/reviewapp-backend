/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	rtbs  = require('react-bootstrap'),
  TabbedArea = rtbs.TabbedArea,
  TabPane = rtbs.TabPane,
  {Link, Route} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  FocusList = require('./FocusMode'),
  {user} = require('../stores/UserStore');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');


var ReviewsApp = React.createClass({

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render: function() {
    var apps = [applications.byStage('in_review'), applications.byStage('email_send'), applications.byStage('review_reply'), applications.byStage('schedule_skype'), applications.byStage('skype_scheduled')],
        titles = ['To Review','Emailed', 'Review Reply', 'Skype Invite Send', 'Skype Scheduled'];

    if (user.attributes.can_admin) {
        apps.splice(0, 0, applications.byStage('incoming'));
        titles.splice(0, 0,  'Incoming');
    }

    if (user.attributes.can_moderate) {
        apps.splice(3,0, applications.byStage('reply_received'));
        titles.splice(3,0, 'Reply Incoming');
    }

    return (
      <div className="main">
        <div className="container">
    	   <TabbedArea className="tabPanel" defaultActiveKey={0}>
          {_.map(apps, function(app_list, index){
              var title = titles[index] + ' ('+ app_list.length + ')';
              return(
                <TabPane className="tab" eventKey={index} tab={title}>
                  <ApplicationList apps={app_list} index={index} />
                </TabPane>)
            })}
        </TabbedArea>
        </div>
      </div>
    );
  }
});

var FocusReview = React.createClass({

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render: function() {
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
        <div className="container">
         <FocusList apps={apps} />
        </div>
      </div>
    );
  }
});

module.exports = {ReviewsApp: ReviewsApp, FocusReview: FocusReview};
