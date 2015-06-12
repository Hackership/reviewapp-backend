/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react'),
    {Panel, Button, Input} = require('react-bootstrap'),
    _ = require("underscore"),
    moment = require('moment'),
    moment_tz = require('moment-timezone/moment-timezone'),
    $ = require('jquery');

var OpenSlots = React.createClass({
  getInitialState: function(){
    return {loadingSlots: true}
  },
  componentDidMount: function(){
    $.getJSON("/api/available_slots").then(function(data){
        this.setState({loadingSlots: false, slots: _.map(data.slots, function(x){return moment.tz(x, "UTC")})})
    }.bind(this));

  },
  render: function(){
    if (this.state.loadingSlots) return (<p>Loading available Time Slots</p>);
    if (!this.state.slots || this.state.slots.length === 0) return (<p>No Slots open available at the moment. Please come back later</p>);

    var zone = this.props.timezone.name || this.props.timezone,
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
                                    return <Button btSize='large' onClick={function(x){self.props.selectZone(slot)}} key={slot.format('LLLL')}>{slot.tz(zone).format('HH:mm ')}</Button>
                                })}
                            </Panel>
                            )
                  });

        return (<div>{slots}</div>);
    }
})

module.exports = {OpenSlots: OpenSlots};
