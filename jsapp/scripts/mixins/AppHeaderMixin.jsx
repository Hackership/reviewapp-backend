var React = require('react/addons'),
  _ = require('underscore'),
  {Col, Row, Grid, Glyphicon, OverlayMixin}  = require('react-bootstrap'),
  {User, Gravatar} = require("../components/User"),
  {user} = require('../stores/UserStore'),
  {AppToolBar} = require('../components/AppToolBar'),
  {MoveButton} = require('../components/MoveToStage'),
  {HeaderTxtMod, HeaderTxtRev} = require('../components/AppHeader'),
  moment = require('moment');

let DE_ANON_STAGES = ['skype_scheduled', 'skyped',
                      'accepted', 'rejected', 'grant_review',
                      'deposit_paid', 'grant_accepted',
                      'inactive'];

var AppHeaderMixin = {
  render_header(app, tools){
    var app = app || this.props.app,
        tools = tools ? <AppToolBar app={app} /> : null,
        stages = tools ? <MoveButton app={app} />: null,
        txt = user.get("can_moderate") ? <HeaderTxtMod app={app} /> : <HeaderTxtRev app={app} />;
    return (
      <Grid>
        <Col xs={1}>
          <Gravatar forceDefault={!_.contains(DE_ANON_STAGES, app.get('stage'))} hash={app.get('gravatar')} size={40} />
        </Col>
        <Col xs={3} xs-offset={1}>
          <Headername app={app} />
          <HeaderIcons app={app} />
        </Col>
        <Col xs={3} xs-offset={4}>
          {txt}
        </Col>
         <Col xs={2} xs-offset={7}>
         {tools}
         </Col>
        <Col xs={2} xs-offset={9}>
         {stages}
        </Col>
      </Grid>
      );
  }
};

module.exports = {AppHeaderMixin: AppHeaderMixin};