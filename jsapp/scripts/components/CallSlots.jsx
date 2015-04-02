/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	{Input, Well, Grid, Row, Col, Button, Panel} = require('react-bootstrap'),
  _ = require('underscore'),
  moment = require('moment'),
  availableZones = require("../stores/TimezonesStore"),
  Select = require('react-select'),
  $ = require('jquery'),
  Actions = require('../actions/actions'),
  DatePicker = require('react-date-picker'),
  {slots} = require("../stores/CallSlotsStore"),
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

function _displaySlot(slot, zone, days){
  if (slot.attributes.once) {
    return slot.ts.tz(zone).format('dddd, MMMM Do YYYY HH:mm ')
  }
  if (days) {
    return slot.ts.tz(zone).format('dddd HH:mm ')
  }
  return slot.ts.tz(zone).format('HH:mm ');
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

    return (<Well>
              <form onSubmit={this.submitForm} className='form-horizontal' >
                <h2>Add another availability</h2>
                <Row>
                  <Col xsOffset={1} mdOffset={1} xs={6} md={6}>
                    <Input type="checkbox" onChange={this.setOnce}>
                      <label>One Time only</label>
                    </Input>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6}>{dateSelector}</Col>
                  <Col xs={12} md={3}><Select onChange={this.selectSlot} refs="timeslot" options={slots} /></Col>
                </Row>
                <hr />
                <Row>
                  <Col xsOffset={1} mdOffset={1}>
                    <Button bsStyle="primary" type="submit">+ Add</Button>
                  </Col>
                </Row>
              </form>
            </Well>)
    }
});


var SkypeSlots = React.createClass({
  getInitialState: function(){
    return {showAdd: false};
  },
  setTimezone: function(tz){
    Actions.setTimezone(moment.tz.zone(tz));
  },

  onCloseAdd: function(){
    this.setState({showAdd: false});
  },

  removeSlot: function(slot){
    var slotText = _displaySlot(slot, user.get("timezone").name, true);
    if (confirm("Really remove "+ slotText + "?")){
      Actions.removeSlot(slot);
    }
  },

  showAdd: function(){
    this.setState({showAdd: true});
  },

  render: function() {
    if (!user.get("timezone")){
      return <TimezoneSelector setTimezone={this.setTimezone} />;
    }

      var zone = user.get("timezone").name,
          self = this,
          regularSlots = _.filter(slots.models, function(slot){
                            return !slot.attributes.once;
                          }),
          oneTimeSlots = _.filter(slots.models, function(slot){
                              return slot.attributes.once && (slot.ts > moment())
                          }),
          slotGroups = _.groupBy(regularSlots, function(slot){
                            return slot.ts.tz(zone).day();
                          }),
          days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays"],
          regularSlotsElems = _.map(_.sortBy(_.keys(slotGroups),
                                                function(x) {return x}),
                                function(day){
                                  var dt = <h3>{days[day]}</h3>,
                                      slotData = slotGroups[day];
                                  return (
                                          <Panel key={day} header={dt}>
                                              {_.map(slotData, function(slot){
                                                  return <Button btSize='large'
                                                              onClick={function(x){self.removeSlot(slot)}}
                                                              key={slot.ts.format('LLLL')}>{_displaySlot(slot, zone)}</Button>
                                                  })
                                              }
                                          </Panel>)
                        }),
          onceSlotElems = (oneTimeSlots.length ? _.map(oneTimeSlots, function(slot){
                          return (<li key={slot.ts}>
                                    <Button btSize='large'
                                            onClick={function(x){self.removeSlot(slot)}}
                                            key={slot.ts.format('LLLL')}>
                                      {_displaySlot(slot, zone)}
                                    </Button>
                                  </li>);

                          }) : <li><em>No upcoming one time slots</em></li>),
          showAdd;

    if (this.state.showAdd){
      showAdd = <AddSlot onClose={this.onCloseAdd} zone={zone.name}/>;
    } else {
      showAdd = <div><Button onClick={this.showAdd}>Add + </Button></div>;
    }

    return (<div>
              <Grid>
                <Row>
                  <Col xs={12} md={8}>
                    {showAdd}
                    <div>
                      <h4>One time Slots</h4>
                      <p>click to remove</p>
                      <ul>
                        {onceSlotElems}
                      </ul>
                    </div>
                    <div>
                      <h3>Regular Slots</h3>
                        <p>click to remove</p>
                        {regularSlotsElems}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <h2>Upcoming calls</h2>
                    <p></p>
                  </Col>
                </Row>
              </Grid>
            </div>)
    ;
  }
});

module.exports = SkypeSlots;
