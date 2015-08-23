/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {applications} = require('../stores/ApplicationStore'),
  {Application} = require("./Application");

var $=require('jquery');

var AppPage = React.createClass({
  render(){
    var app = applications.get(parseInt(this.props.params.appId));
    return  (
      <div className="main">
        <div className="main-container">
          <Application app={app} />
        </div>
      </div>
      );
  }
});

module.exports = {AppPage: AppPage}