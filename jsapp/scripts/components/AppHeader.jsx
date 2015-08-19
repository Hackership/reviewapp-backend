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
  {Link} = require('react-router'),
  {AppToolBar} = require('./AppToolBar'),
  {MoveButton} = require('./MoveToStage'),
  {AppHeaderMixin} = require('../mixins/AppHeaderMixin'),
  moment = require('moment');

let DE_ANON_STAGES = ['skype_scheduled', 'skyped',
                      'accepted', 'rejected', 'grant_review',
                      'deposit_paid', 'grant_accepted',
                      'inactive'];



var ApplicationListHeader = React.createClass({
  mixins: [AppHeaderMixin],
  render(){
      return (
        <li className="panel-background">
          <Link to="appPage" params={{appId: this.props.app.id}}>
            {this.render_header(this.props.app, false)}
          </Link>
        </li>
    )
  }

});

var EmailAppHeader = React.createClass({
  mixins: [AppHeaderMixin],
  render: function() {
    return (
        <li className="panel-background">
          <Link to="emailPage" params={{appId: this.props.app.id}}>
            {this.render_header(this.props.app, false)}
          </Link>
        </li>
    )
  }
});



module.exports = {ApplicationListHeader: ApplicationListHeader,
                  EmailAppHeader: EmailAppHeader};
