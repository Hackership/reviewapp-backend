/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react'),
    {Route, Link, RouteHandler, NotFoundRoute, run} = require('react-router'),
    {Panel, Button, Input} = require('react-bootstrap'),
    _ = require("underscore"),
    moment = require('moment'),
    availableZones = require("../stores/TimezonesStore"),
    Select = require('react-select'),
    $ = require('jquery');

require("react-select/dist/default.css");

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
                this.setState({'info': data, loading: false});
                this._refresh_slots();
            }.bind(this)
            ).fail(function(){
                this.setState({'failed': true,
                               'loading': false});
            }.bind(this))

    },
    _refresh_slots: function(){
        $.getJSON("/api/available_slots").then(function(data){
            this.setState({loadingSlots: false, slots: _.map(data.slots, function(x){return moment.tz(x, "UTC")})})
        }.bind(this))
    },
    getInitialState: function(){
        return {selectedSlot: false, loading: true, success: false, failed: false, loadingSlots: true, reselect: false}
    },
    setTimezone: function(tz){
        this.setState({timezone: moment.tz.zone(tz)});
    },
    resetTimezone: function () {
        this.setState({timezone: null});
    },
    clickReselect: function(){
        this.setState({reselect: true});
    },

    selectZone: function(slot){
        console.log(slot);
        this.setState({selectedSlot: slot});

    },
    scheduleCall: function(evt){
        evt.preventDefault();
        var skypeAccount = this.refs.skype.getValue();
        this.setState({loading: true});
        var params = this.props.params
        $.post("/application/" + params.app_id + "/schedule/" + params.key,
            {skype: skypeAccount, slot: moment.utc(this.state.selectedSlot).format('YYYY-MM-DD HH:mm:ss')}
            ).then(function(data){
                this.setState({'success': true, 'loading': false});
            }.bind(this)
            ).fail(function(){
                // we aren't really handeling this just yet...
                this.setState({'slotFailed': true,
                               'loading': false})
            }.bind(this))



    },
    render: function(){
        if (this.state.loading){
            return <p>Loading</p>;
        } else if  (this.state.failed){
            return <p>Application loading failed.</p>;
        }

        if (this.state.success){
            var title=<h3>Congratulations</h3>,
                zone = this.state.timezone.name,
                slot = this.state.selectedSlot;
            return (
                    <Panel header={title} bsStyle='success'>
                        <p>Your call is scheduled for <strong>{slot.tz(zone).format('LLLL')}</strong>.<br/>You will receive an email with an invite shortly.</p>
                        <p>See you soon!</p>
                    </Panel>
                )

        }


        var head = <p>Hi, {this.state.info.name}!</p>;

        if (!this.state.timezone){
            return (
                <div>
                    {head}
                    <h2>Please select your timezone</h2>
                    <Select options={availableZones} onChange={this.setTimezone}/>
                </div>
            );
        }


        if (this.state.selectedSlot){
            var title=<h3>Almost done</h3>,
                zone = this.state.timezone.name,
                slot = this.state.selectedSlot;
            return (
                    <Panel header={title} bsStyle='info'>
                        <p>Youʼve selected <strong>{slot.tz(zone).format('LLLL')}</strong> for the call.</p>
                        <p>If youʼd now let us know about the <strong>skype account</strong> we should call, we are done</p>
                        <form onSubmit={this.scheduleCall} >
                            <Input type='text' placeholder="Skype account" ref='skype' required />
                            <Button bsStyle='primary' type='submit'>Schedule Call</Button>
                        </form>
                    </Panel>
                )
        }

        if (this.state.info.stage === "skype_scheduled" && !this.state.reselect){
            var call = _.find(this.state.info.calls, function(call){
                                return !call.failed;
                                });
            console.log(call);
            if (call){
                var zone = this.state.timezone.name,
                    title = <h3>Call scheduled</h3>,
                    dt = moment(call.scheduledAt);
                return (
                    <Panel header={title} bsStyle='success'>
                        {head}
                        <p>Your call is scheduled for <strong>{dt.tz(zone).format('LLLL')}</strong>.</p>
                        <p>You canʼt make it? <button className="btn" onClick={this.clickReselect}>Schedule another call here</button></p>
                    </Panel>
                )
            }

        }

        var slots = <p>Loading available Time Slots</p>;
        if (!this.state.loadingSlots){
            if (!this.state.slots){
                slots = <p>No Slots open available at the moment. Please come back later</p>
            } else {
                var zone = this.state.timezone.name,
                    self = this,
                    slotGroups = _.groupBy(this.state.slots, function(slot){
                        return slot.tz(zone).format('YYYYDDDD');
                    }),

                slots = _.map(_.sortBy(_.keys(slotGroups),
                                       function(x) {return x}),
                              function(timestamp){
                                var dt = <h3>{moment(timestamp, 'YYYYDDDD').format("dddd, MMMM Do YYYY")}</h3>,
                                    slots = slotGroups[timestamp];
                                return (
                                        <Panel key={timestamp} header={dt}>
                                            {_.map(slots, function(slot){
                                                return <Button btSize='large' onClick={function(x){self.selectZone(slot)}} key={slot.format('LLLL')}>{slot.tz(zone).format('HH:mm ')}</Button>
                                            })}
                                        </Panel>
                                        )
                              });

            }
        }
        return (
            <div>
                {head}
                <h3>Please select the timeslot, youʼd like to have the call at</h3>
                <p>Times are shown in 24h format, adapted for the local timezone of <em>{this.state.timezone.name}</em> (<a onClick={this.resetTimezone}>change</a>)</p>
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
