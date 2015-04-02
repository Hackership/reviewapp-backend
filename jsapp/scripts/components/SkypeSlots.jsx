/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	{Input, Well, Grid, Row, Col, Button} = require('react-bootstrap'),
  _ = require('underscore'),
  moment = require('moment'),
  availableZones = require("../stores/TimezonesStore"),
  Select = require('react-select'),
  $ = require('jquery'),
  Actions = require('../actions/actions'),
  DatePicker = require('react-date-picker'),
  {user} = require('../stores/UserStore');

require("react-select/dist/default.css");
require('react-date-picker/index.css');

var TimezoneSelector = React.createClass({
  render: function(){
    return (<Well>
              <h2>Please select your timezone</h2>
              <Select options={availableZones} onChange={this.props.setTimezone}/>
            </Well>)
  }
});

function _slotformat (x, offset) {
  if (x < 10){
    x = "0" + x;
  }
  return offset? x + ":" + offset : x + ":00";
}

var AddSlot = React.createClass({

  getInitialState: function(){
    return {oneTime: false, date: moment(), slot: [0, 0]};
  },

  setOnce: function(evt){
    this.setState({oneTime: evt.target.checked});
  },

  selectDate: function(date){
    this.setState({date: date});
  },

  selectSlot: function(slot){
    this.setState({slot: slot})
  },

  submitForm: function(evt){
    evt.preventDefault();
    var slot = this.state.slot,
        date = moment.tz(this.state.date + " " + slot, 'YYYY-MM-DD H:mm', this.props.zone);
    Actions.addSkypeSlot({date: date, once: this.state.oneTime});
    this.props.onClose();
  },

  render: function () {
    var days = _(7).times(function(x){
                  var day = moment().day(x);
                      return {value: day.format("YYYY-MM-DD"), label: day.format("dddd")};
                }),
        slots = _.flatten(_(24).times(function(x) {
            return [{value: x + ":00", label: _slotformat(x)},
                    {value: x + ":30", label: _slotformat(x, "30")}
                    ]
                  }
                )
            ),
        dateSelector = <Select onChange={this.selectDate} ref="weekday" options={days} />;

    if (this.state.oneTime) {
      dateSelector = <DatePicker onChange={this.selectDate} ref="datepicker" />
    }

    return (<Grid className="container">
              <form onSubmit={this.submitForm} className='form-horizontal' >
                <h2>Add another availability</h2>
                <Input type="checkbox" onChange={this.setOnce}>
                  <label>One Time only</label>
                </Input>
                <Row>
                  <Col xs={12} md={6}>{dateSelector}</Col>
                  <Col xs={12} md={3}><Select onChange={this.selectSlot} refs="timeslot" options={slots} /></Col>
                </Row>
                <Row>
                  <Button bsStyle="primary" type="submit">+ Add</Button>
                </Row>
              </form>
            </Grid>)
    }
});


var SkypeSlots = React.createClass({
  setTimezone: function(tz){
    Actions.setTimezone(moment.tz.zone(tz));
  },

  onCloseAdd: function(){
    this.setState({showAdd: false});
  },

  render: function() {
    if (!user.get("timezone")){
      return <TimezoneSelector setTimezone={this.setTimezone} />;
    }
    var timezone = user.get("timezone");

    return <AddSlot onClose={this.onCloseAdd} zone={timezone.name}/>;
  }
});

module.exports = SkypeSlots;
