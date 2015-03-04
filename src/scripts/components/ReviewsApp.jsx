/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	rtbs  = require('react-bootstrap'),
	Panel = rtbs.Panel,
    Accordion = rtbs.Accordion,
    Input = rtbs.Input,
    Button = rtbs.Button,
    Modal = rtbs.Modal,
	ReactTransitionGroup = React.addons.TransitionGroup;

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var imageURL = require('../../images/yeoman.png');

var ReviewsApp = React.createClass({
  render: function() {
    return (
    	<div className="center">
        <ReactTransitionGroup transitionName="fade">
          <img src={imageURL} />
           <Button>button</Button>
        </ReactTransitionGroup>
        </div>
    );
  }
});

module.exports = ReviewsApp;
