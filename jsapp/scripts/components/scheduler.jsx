/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react'),
    Router = require('react-router'),
    _ = require("underscore"),
    Route = Router.Route,
    Link = require('react-router').Link,
    RouteHandler = Router.RouteHandler,
    moment = require('moment'),
    moment_tz = require('moment-timezone/moment-timezone'),
    zones = require("../data/timezones"),
    Select = require('react-select'),
    $ = require('jquery');

moment.tz.load(zones);

require("react-select/dist/default.css");

var availableZones = _.map(zones.zones, function(x){
    var name = x.split('|')[0];
    return {value: name, label: name.replace("_", " ")};
});

var Scheduler = React.createClass({
    componentWillMount: function(){
        var params = this.props.params
        $.getJSON("/application/" + params.app_id + "/external/" + params.key
            ).then(function(data){
                this.setState({'info': data, loading: false})
            }.bind(this)
            ).fail(function(){
                this.setState({'failed': true,
                               'loading': false})
            }.bind(this))
    },
    getInitialState: function(){
        return {loading: true, failed: false}
    },
    setTimezone: function(tz){
        this.setState({timezone: moment.tz.zone(tz)});
    },
    resetTimezone: function () {
        this.setState({timezone: null});
    },
    render: function(){
        if (this.state.loading){
            return <p>Loading</p>;
        } else if  (this.state.failed){
            return <p>Application loading failed.</p>;
        }

        var head = <p>Hi, {this.state.info.name}!</p>;

        if (!this.state.timezone){
            return (
                <div>
                    {head}
                    <h2>Please select a timezone</h2>
                    <Select options={availableZones} onChange={this.setTimezone}/>
                </div>
            );
        }
        return (
            <div>
                {head}
                <div>
                    <p>Your timezone is {this.state.timezone.name} <a onClick={this.resetTimezone}>change</a></p>
                </div>
                <h2>Please select a timeslot</h2>
            </div>
        );
    }
});

var MainAppWrap = React.createClass({

    render: function(){
        return (
            <div className="container">
                <header>
                    <h1>Hackership Application Review Scheduler</h1>
                </header>
                <RouteHandler {...this.props} />
            </div>
        )
    }
})

var Routes = (
    <Route path="/" handler={MainAppWrap}>
        <Route name="scheduler" path="schedule/:app_id/:key" handler={Scheduler} />
    </Route>
);

Router.run(Routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.getElementById('content'));
});
