/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  _ = require('underscore'),
  {Button, ButtonGroup, Nav}  = require('react-bootstrap'),
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
      if (params.batch && (applications.batchCount()[params.batch] || params.batch === 'all')) return;

      if (params.batch){
        // redirect to from the old days before batch-separation
        transition.redirect("appStage", {stage: params.batch, batch: 'all'});
      } else {
        transition.redirect("batch", {batch: 'all'});
      }
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
        batches =  _.keys(batchCount),
        all_title = "All" + ' (' + applications.length +')';
        return(
          <div className="filters">
             <ButtonGroup>
                <Link className="btn btn-info" to="batch" params={{batch: 'all', stage: activeStage}} active>{all_title}</Link>
                {_.map(batches, (batch) =>
                <Link className="btn btn-info" to="batch" params={{batch: batch, stage: activeStage}} active>{batch} ({batchCount[batch]})</Link>
        )}
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
