/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Button, ButtonGroup}  = require('react-bootstrap'),
	{Nav} = require('react-bootstrap'),
  {Link, Route, RouteHandler} = require('react-router'),
  {ApplicationList} = require('./ApplicationList'),
  {applications, availableStages} = require('../stores/ApplicationStore'),
  FocusList = require('./FocusMode'),
  {user} = require('../stores/UserStore');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');

var AppsList = React.createClass({
    render() {
      var app_list = !this.props.params.batch || this.props.params.batch === 'all' ? applications.byStage(this.props.params.stage) : applications.byStageForBatch(this.props.params.stage, this.props.params.batch);
      return <ApplicationList apps={app_list} />
    }
});

var BatchFilterView = React.createClass({

  statics: {
    willTransitionTo: function (transition, params) {
      if (params.stage && params.batch) return;

      var stageCounts = applications.stageCounts(),
          stages = availableStages(),
          stage = (_.find(stages, function(stage){
                          return stageCounts[stage.key];
                        }) || stages[0]).key;
      transition.redirect("batch", {stage: stage, batch: params.batch || 'all'});
    }
  },

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render() {
    var batchCount = applications.batchCount(),
        activeStage = this.props.params.stage,
        all_title = "All" + ' (' + applications.length +')',
        ber_title = "15-07-BER" + ' ('+ (batchCount['15-07-BER'] || 0) + ')',
        st_title = "15-09-ST" + ' ('+ (batchCount['15-09-ST'] || 0) + ')',
        all = <Link className="btn btn-info" to="batch" params={{batch: 'all', stage: activeStage}} active>{all_title}</Link>,
        ber = <Link className="btn btn-info" to="batch" params={{batch: '15-07-BER', stage: activeStage}} active>{ber_title}</Link>,
        cr = <Link className="btn btn-info" to="batch"  params={{batch: '15-09-ST', stage: activeStage}} active>{st_title}</Link>;

        return(
          <div className="filters">
             <ButtonGroup>
                {all}
                {ber}
                {cr}
              </ButtonGroup>
              <RouteHandler {...this.props}/>
          </div>
          );
  }
});

var StagesView = React.createClass({

  statics: {
    willTransitionTo: function (transition, params) {
      if (params.stage && params.batch) return;

      var stageCounts = applications.stageCounts(),
          stages = availableStages(),
          stage = (_.find(stages, function(stage){
                          return stageCounts[stage.key];
                        }) || stages[0]).key;
      transition.redirect("appStage", {stage: stage, batch: params.batch});
    }
  },

  componentDidMount: function(){
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render() {
    var stages = availableStages(),
        activeBatch = this.props.params.batch,
        stageCounts = activeBatch === 'all' ? applications.stageCounts() : applications.stageCountsForBatch(this.props.params.batch),
        activeStage = this.props.params.stage;
    return (
          <div className="main">
            <div className="main-container">
        	   <Nav className="tabPanel">
              <ul className="tabPanel nav nav-tabs">
                {_.map(stages, (stage, index) =>
                  <li className={stage.key === activeStage? "active" : ""} eventKey={stage.key}>
                    <Link to="appStage" params={{stage: stage.key, batch: activeBatch}}>{stage.title + ' ('+ (stageCounts[stage.key] || 0) + ')'}</Link>
                  </li>
                )}
              </ul>
            </Nav>
            <RouteHandler {...this.props}/>
            </div>
          </div>
    );
  }
});

var FocusReview = React.createClass({

  componentDidMount() {
    var self = this;
    applications.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });

    user.on("all", function(){
        self.isMounted() && self.forceUpdate();
      });
  },

  render() {
    var apps;

    if (user.attributes.can_admin) {
      apps = applications.byUrgency('admin');
    } else if (user.attributes.can_moderate) {
       apps = applications.byUrgency('moderator');
    } else {
       apps = applications.byUrgency('reviewer');
    }

    return (
      <div className="main">
        <div className="main-container">
         <FocusList apps={apps} />
        </div>
      </div>
    );
  }
});

module.exports = {BatchFilterView: BatchFilterView,
                  StagesView: StagesView,
                  AppsList: AppsList,
                  FocusReview: FocusReview};
