/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	rtbs  = require('react-bootstrap'),
	Panel = rtbs.Panel,
  Accorduin = rtbs.Accordion,
	ReactTransitionGroup = React.addons.TransitionGroup;

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var Application = React.createClass({
  
  render: function() {
    return (
      <Panel header=this.props.title>
      {content}
      </Panel>
      );
  }
});

var ApplicationsList = React.createClass({
  var fakeApps = [{'field one':'bunch of text', 'field two: more text more text more text more text more text more text more text more text more text'},
{'field one':'bunch of text', 'field two: lalalalal'}];

  render: function() {
    return (
        <Accordion>
        </Accordion>
    );
  },
});

module.exports = ApplicationsList;