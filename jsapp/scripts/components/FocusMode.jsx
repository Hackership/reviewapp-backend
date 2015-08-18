/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
	{Modal, Panel, Input, Pager, PageItem, Button}  = require('react-bootstrap'),
	ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  Action = require('../actions/actions'),
  markdown = require( "markdown" ).markdown,
  Highlight = require('react-highlight'),
  {Application} = require('./ApplicationList');


var Counter = React.createClass({

  render: function() {
    var count = this.props.index + '/' + this.props.total;
    return (
      <div className="counter">
      <h4>{count}</h4>
      </div>
      )
  }
})
var FocusList = React.createClass({

  getInitialState: function(){
    return {'key': 0};
  },

  moveForward: function(evt){
    evt.preventDefault();

    var new_key = this.state.key + 1;

    if (this.props.apps.length > new_key){
      this.setState({key: new_key});
    }

  },

  moveBack: function(evt){
    evt.preventDefault();

    var new_key = this.state.key - 1;

    if (new_key >= 0){
      this.setState({key: new_key});
    }
  },


  render: function() {
    var apps = this.props.apps ?  this.props.apps : [],
        app = apps[this.state.key],
        activePrev = (this.state.key === 0) ? true : false,
        activeNxt = (this.state.key === (apps.length -1) ) ? true : false,
        count = this.state.key + 1;

    if (!app) {
      return (
         <div className="focusList">
         <p>Loading...</p>
         </div>
        );
    }


    return (
       <div className="focusList">
         <Pager>
          <PageItem disabled={activePrev} onClick={this.moveBack} previous>&larr; Previous</PageItem>
          <PageItem disabled={activeNxt} onClick={this.moveForward} next>Next &rarr;</PageItem>
           <Counter index={count} total={apps.length} />
        </Pager>
        <Application app={app} activeKey={this.state.key} index={this.state.key}/>
       </div>
    );
  }
});


module.exports = {FocusList: FocusList};