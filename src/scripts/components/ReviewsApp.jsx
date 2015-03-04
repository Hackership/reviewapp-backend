/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	rtbs  = require('react-bootstrap'),
  TabbedArea = rtbs.TabbedArea,
  TabPane = rtbs.TabPane,
  ApplicationList = require('./ApplicationList');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var ReviewsApp = React.createClass({

  render: function() {
    var stageOne = "To Anonymize (12)",
      stageTwo = "Waiting For Review (3)",
      stageThree = "Ready For E-mail (0)",
      stageFour = "Emailed (1)",
      stageFive = "Received Replies (2)";
      
    return (
      <div className="main">
        <div className="container">
    	   <TabbedArea className="tabPanel" defaultActiveKey={1}>
          <TabPane className="tab" eventKey={1} tab={stageOne}><ApplicationList type="stage-1"/></TabPane>
          <TabPane className="tab" eventKey={3} tab={stageTwo}><ApplicationList type="stage-2"/></TabPane>
          <TabPane className="tab" eventKey={4} tab={stageThree}><ApplicationList type="stage-2"/></TabPane>
          <TabPane className="tab" eventKey={5} tab={stageFour}><ApplicationList type="stage-2"/></TabPane>
          <TabPane className="tab" eventKey={6} tab={stageFive}><ApplicationList type="stage-2"/></TabPane>
        </TabbedArea>
        </div>
      </div>
    );
  }
});

module.exports = ReviewsApp;
