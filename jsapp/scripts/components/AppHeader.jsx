/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Panel}  = require('react-bootstrap'),
  ReactTransitionGroup = React.addons.TransitionGroup,
  {user} = require('../stores/UserStore'),
  {Link} = require('react-router'),
  {AppHeaderMixin} = require('../mixins/AppHeaderMixin'),
  moment = require('moment');



var AppHeader= React.createClass({
  mixins: [AppHeaderMixin],
  render(){
      var link = this.props.link;
      return (
        <li className="panel-background">
          <Link to={link} params={{appId: this.props.app.id}}>
            {this.render_header(this.props.app, false)}
          </Link>
        </li>
    )
  }

});

module.exports = {AppHeader: AppHeader}

