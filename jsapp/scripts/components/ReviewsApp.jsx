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
  ApplicationList = require('./ApplicationList'),
  {applications} = require('../stores/ApplicationStore'),
  {user} = require('../stores/UserStore');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');


var ReviewsApp = React.createClass({

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.forceUpdate();
    });

    user.on("all", function(){
        self.forceUpdate();
      });
  },

  render: function() {
    var apps = [applications.byStage('in_review'), applications.byStage('email_send'), applications.byStage('reply_received'), applications.byStage('skyped')],
        titles = ['To Review','Emailed', 'Reply Received', 'Skyped'];

    if (user.attributes.can_admin) {
        apps.splice(0, 0, applications.byStage('incoming'));
        titles.splice(0, 0,  'Incoming');
    }

    if (user.attributes.can_moderate) {
        apps.splice(2, 0, applications.byStage('in_review'));
        titles.splice(2 ,0, 'To_Email');
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

module.exports = ReviewsApp;
