/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	{Modal, ButtonToolbar, Panel, DropdownButton, MenuItem, Input, Well, Col, Row, Grid, Glyphicon, Accordion, PanelGroup, OverlayMixin, Button}  = require('react-bootstrap'),
  {User, Gravatar} = require("./User"),
	ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  Action = require('../actions/actions'),
  markdown = require( "markdown" ).markdown,
  {Link} = require('react-router'),
  Highlight = require('react-highlight'),
  availableZones = require("../stores/TimezonesStore"),
  Select = require('react-select'),
  {applications, getInstructionForStage} = require('../stores/ApplicationStore'),
  {AppHeader} = require('./AppHeader'),
  {Application} = require("./Application"),
  moment = require('moment');

var $=require('jquery');


var ApplicationList = React.createClass({

  getInitialState: function(){
    return {};
  },

  handleSelect: function(selectedKey) {
    this.setState({'activeKey': selectedKey});
  },

  render: function() {
    var apps = _.sortBy(this.props.apps, 'changedStageAt');

    var app = apps[0],
        self = this;

    return (
       <div className="applicationList">
        <ul className="panel-group">
        {_.map(apps, (app, index) =>
          <AppHeader link="appPage" app={app} />
        )}
        </ul>
      </div>
    );
  }
});


module.exports = {ApplicationList: ApplicationList};
