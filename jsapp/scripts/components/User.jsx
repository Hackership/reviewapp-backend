/**
 * @jsx React.DOM
 */

'use strict';

var {ReviewsApp, FocusReview} = require('./ReviewsApp'),
    AddReviewer = require('./AddReviewer'),
    CallSlots = require('./CallSlots'),
    {ApplicationList} = require('./ApplicationList'),
    React = require('react'),
    Router = require('react-router'),
    {Alert, ProgressBar, DropdownButton, MenuItem}  = require('react-bootstrap'),
    Route = Router.Route,
    Link = require('react-router').Link,
    dispatcher = require('../dispatchers/dispatcher'),
    Actions = require('../actions/actions'),
    RouteHandler = Router.RouteHandler,
    {applications} = require('../stores/ApplicationStore'),
    {user} = require('../stores/UserStore'),
    _ = require("underscore");

var Gravatar = React.createClass({
    render: function () {
        var url = "//www.gravatar.com/avatar/" + this.props.hash + ".jpg?d=retro";
        if (this.props.forceDefault){
            url += "&f=y";
        }
        if (this.props.size){
            url += "&s=" + this.props.size;
        }
        return <img className="gravatar" src={url} alt="Gravatar" />
    }
});

var User = React.createClass({
    render: function(){
        var user = this.props.user;

        if (!user){
            return <em>unknown</em>;
        }
        var name = user.name || 'unknown',
            gravatar = user.gravatar;
        return (<span className="user">
                <Gravatar forceDefault={false} hash={gravatar} size={20} /> {name}
               </span>)
    }
});

module.exports = {User: User, Gravatar: Gravatar}