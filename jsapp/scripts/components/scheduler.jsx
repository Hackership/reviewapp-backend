/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react'),
    {Route, Link, RouteHandler, NotFoundRoute, run} = require('react-router'),
    _ = require("underscore"),
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

var NotFound = React.createClass({
    render: function(){
        return (
            <div>
                <h2>404 - Resource not found</h2>
                <p>If you arrived here after clicking a link in an email, try copy pasting it instead. If this keeps happning, please inform the administrators!</p>

            </div>
            );
    }
})

var Scheduler = React.createClass({
    componentWillMount: function(){
        var params = this.props.params
        $.getJSON("/application/" + params.app_id + "/external/" + params.key
            ).then(function(data){
                this.setState({'info': data, loading: false})
                this._refresh_slots();
            }.bind(this)
            ).fail(function(){
                this.setState({'failed': true,
                               'loading': false})
            }.bind(this))

    },
    _refresh_slots: function(){
        $.getJSON("/api/available_slots").then(function(data){
            this.setState({loadingSlots: false, slots: _.map(data.slots, function(x){return moment.tz(x, "UTC")})})
        }.bind(this))
    },
    getInitialState: function(){
        return {loading: true, failed: false, loadingSlots: true}
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
        var slots = <p>Loading available Time Slots</p>;
        if (!this.state.loadingSlots){
            if (!this.state.slots){
                slots = <p>No Slots open available at the moment. Please come back later</p>
            } else {
                var zone = this.state.timezone.name;
                slots = (<ul>
                    {_.map(this.state.slots, function(slot){
                        return <li>{slot.tz(zone).format('LLLL')}</li>
                    })}
                </ul>)
            }
        }
        return (
            <div>
                {head}
                <h2>Please select a timeslot</h2>
                <p>Times are shown for local time in {this.state.timezone.name} <a onClick={this.resetTimezone}>change</a></p>
                {slots}
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
        <NotFoundRoute handler={NotFound} />
    </Route>
);

run(Routes, function (Handler, state) {
  var params = state.params;
  React.render(<Handler params={params}/>, document.getElementById('content'));
});
