/**
 * @jsx React.DOM
 */

'use strict';

var ReviewsApp = require('./ReviewsApp');
var ApplicationList = require('./ApplicationList');
var React = require('react');
var Router = require('react-router');
var Route = Router.Route;

var content = document.getElementById('content');

var Routes = (
  <Route handler={ReviewsApp}>
    <Route name="/" handler={ReviewsApp}/>
  </Route>
);

Router.run(Routes, function (Handler) {
  React.render(<Handler/>, content);
});
