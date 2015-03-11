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
  {applications} = require('../stores/ApplicationStore');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');


var ReviewsApp = React.createClass({

  render: function() {
    var apps = [applications.byStage('incoming'), applications.byStage('in_review'), applications.byStage('email_send'), applications.byStage('reply_received'), applications.byStage('skyped')],
        titles = ['Incoming', 'To Review', 'Emailed', 'Reply Received', 'Skyped'];

    return (
      <div className="main">
       <Link to="reviewer">Reviewer</Link>
        <div className="container">
    	   <TabbedArea className="tabPanel" defaultActiveKey={1}>
          {_.map(apps, function(app, index){
              var title = titles[index] + ' ('+ app.length + ')';
              return(
                <TabPane className="tab" eventKey={index} tab={title}>
                  <ApplicationList apps={app}/>
                </TabPane>)
            })}
        </TabbedArea>
        </div>
      </div>
    );
  }
});

module.exports = ReviewsApp;
