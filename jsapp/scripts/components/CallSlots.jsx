/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
	{Input, Well, Grid, Row, Col, Button, Panel, Modal, ButtonToolbar} = require('react-bootstrap'),
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

function _displayCall(call, zone){
  return moment(call.scheduledAt).tz(zone).format('dddd, MMMM Do YYYY HH:mm ')
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
    return {oneTime: false, date: moment(), slot: "00:00"};
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
    Actions.addCallSlot({datetime: date, once: this.state.oneTime});
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
            <div className="cal-add-box">
              <form onSubmit={this.submitForm} className='form-horizontal' >
                <h3>Add another availability</h3>
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
                  <ButtonToolbar>
                    <Button bsStyle="primary" type="submit">+ Add</Button>
                    <Button bsStyle="link" onClick={this.props.onClose}>cancel</Button>
                  </ButtonToolbar>
                </Row>
              </form>
               </div>
            </Well>)
    }
});

var TimeRange = React.createClass({
  selectFrom: function (value) {
    this.props.selectFrom(this.props.index, value);
  },
  selectUntil: function (value) {
    this.props.selectUntil(this.props.index, value);
  },
  remove: function(){
    this.props.remove(this.props.index);
  },
  render: function () {
    var slots = _.flatten(_(24).times(function(x) {
            return [{value: x + ":00", label: _slotformat(x)},
                    {value: x + ":30", label: _slotformat(x, "30")}];
                  })
            );
    return (<Row>
                <div className="col-xs-1 col-xs-offset-1">
                  From:
                </div>
                <div className="col-xs-3">
                  <Select onChange={this.selectFrom} value={this.props.from} options={slots} />
                </div>
                <div className="col-xs-1 col-xs-offset-0">
                  Until:
                </div>
                <div className="col-xs-3">
                  <Select onChange={this.selectUntil} value={this.props.until} options={slots} />
                </div>
                <Button
                      bsSize='xsmall' bsStyle="warning"
                      onClick={this.remove}>x</Button>
            </Row>)
  }

});

function splitMap(val){
  var val = val.split(":");
  return parseInt(val[0], 10) + (parseInt(val[1], 10) === 30 ? 0.5 : 0);
}

function _unfold(from, until){
  var from = splitMap(from),
      until = splitMap(until);
  var results = [];
  while (from < until){
    var hour = parseInt(from, 10);
    results.push([hour, from % hour ? 30 : 0])
    from += 0.5;
  }
  return results;
}

var AddMany = React.createClass({
  getInitialState: function(){
    return {slots: [{"from": "10:00", "until": "13:00"}]};
  },
  addSlot: function (argument) {
    this.state.slots.push({"from": "10:00", "until": "13:00"});
    this.forceUpdate()
  },
  selectFrom: function (idx, from) {
    this.state.slots[idx]['from'] = from;
    this.forceUpdate()
  },
  selectUntil: function (idx, until) {
    this.state.slots[idx]['until'] = until;
    this.forceUpdate()
  },
  remove: function(idx){
    this.state.slots.splice(idx, 1);
    this.forceUpdate();
  },
  submit: function(){

    var self = this,
        days = _.filter(['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'], function(day){
      return self.refs[day].getChecked();
    });

    if (!days.length || !this.state.slots.length){
      return alert("You need to select at least one day and time slot!");
    }

    var zone = this.props.zone,
        slotTimes = _.uniq(_.flatten(_.map(this.state.slots, function(slot){
            return _unfold(slot.from, slot.until);
        }), true)),
        slots = _.flatten(_.map(days, function(day){
            return _.map(slotTimes, function(slot){
              return {datetime: moment.tz(day + " " + slot.join(":"), 'ddd hh:mm', zone),
                once: false};
            })
        }));

    Actions.addCallSlot(slots);
    this.props.onClose && this.props.onClose();
  },
  render: function(){
    var self = this;
    return ( <Well>
      <div className="cal-add-box">
              <Row>
              <h4>Please specify your regular availability</h4>
              </Row>
              <Row>
               <div className="title-cal"><strong>Days</strong></div>
              </Row>

              <Row>
              <form>
                <Input type="checkbox"
                     wrapperClassName="col-xs-1"
                      ref='mon' defaultChecked={true} label="Mon" />
                <Input type="checkbox"
                     wrapperClassName="col-xs-1"
                      ref='tue' defaultChecked={true} label="Tue" />
                <Input type="checkbox"
                     wrapperClassName="col-xs-1"
                     ref='wed' defaultChecked={true} label="Wed" />
                <Input type="checkbox"
                      wrapperClassName="col-xs-1"
                      ref='thur' defaultChecked={true} label="Thur" />
                <Input type="checkbox"
                     wrapperClassName="col-xs-1"
                      ref='fri' defaultChecked={true} label="Fri" />
                <Input type="checkbox"
                     wrapperClassName="col-xs-1"
                      ref='sat' defaultChecked={false} label="Sat" />
                <Input type="checkbox"
                      wrapperClassName="col-xs-1"
                      ref='sun' defaultChecked={false} label="Sun" />
                </form>
                </Row>
              <Row>

                <h5><strong>Time</strong></h5>
                <div>
                {_.map(this.state.slots, function(slot, idx){
                    return <TimeRange key={idx}
                                      from={slot.from} until={slot.until} index={idx}
                                      selectUntil={self.selectUntil} selectFrom={self.selectFrom}
                                      remove={self.remove} />

                  })}
                </div>
              </Row>
              <Row>
                <div className="col-xs-offset-8 row-cal">
                  <Button
                      bsSize='small' bsStyle="success"
                      onClick={this.addSlot}>+ More slots</Button>
                </div>
              </Row>
              <div className="row-cal">
              <Row>
              <ButtonToolbar>
                <Button onClick={this.submit} bsSize="large" bsStyle="primary">Submit</Button>
                <Button onClick={this.props.onClose} bsStyle="link">cancel</Button>
                </ButtonToolbar>
              </Row>
              </div>
                </div>
            </Well>
            );
  }
});

var SuggestedSlots = React.createClass({
  componentWillMount: function(){
    this._refreshSuggestions();
    slots.on("all", function(){
      this._refreshSuggestions();
    }.bind(this));
  },
  _refreshSuggestions: function(){
    $.getJSON("/api/suggested_slots").then(function(data){
      this.setState({"suggestedSlots":  _.map(data.slots, function(x){return moment.tz(x, "UTC"); })});
    }.bind(this));
  },
  getInitialState: function(){
    return {showAdd: false, suggestedSlots: false};
  },

  addSuggestedSlot: function(dt){
    this.setState({selectedSlot: dt});
  },

  closeModal: function(){
    this.setState({selectedSlot: false});
  },
  addRegular: function(){
    Actions.addCallSlot({datetime: this.state.selectedSlot, once: false});
    this.setState({selectedSlot: false, suggestedSlots: false});
  },
  addOnce: function(){
    Actions.addCallSlot({datetime: this.state.selectedSlot, once: true});
    this.setState({selectedSlot: false, suggestedSlots: false});
  },
  render: function(){

    if (!this.state.suggestedSlots){
      return <span />;
    }
    var zone = user.get("timezone"),
        self = this,
        modal = this.state.selectedSlot ? (<Modal ref="modal" bsStyle='primary' title='Add Timeslot' onRequestHide={this.closeModal} animation={true}>
                <div className='modal-body'>
                  <h4>Add Timeslot</h4>
                  <p>Do you want to add this time slot once or reguarly every week?</p>
                  <p>{_displayCall({scheduledAt: this.state.selectedSlot}, zone)}</p>
                </div>
                <div className='modal-footer'>
                  <ButtonToolbar><Button bsStyle="primary" onClick={this.addRegular}>Every Week</Button> <Button bsStyle="success" onClick={this.addOnce}>Only Once</Button> <a onClick={this.closeModal}>Cancel</a></ButtonToolbar>
                </div>
              </Modal>) : <span />;
    return (<div className="cal-side">
              {modal}
              <h3>Suggested Slots</h3>
              <p>Are you available at any of these times?</p>
              <ul>
                {_.map(this.state.suggestedSlots, function(dt){
                  return <li><Button bsStyle="link" onClick={function(){self.addSuggestedSlot(dt)}}>{_displayCall({scheduledAt: dt}, zone)}</Button></li>
                })}
              </ul>
            </div>)
  }

})


var CallSlots = React.createClass({
  componentDidMount: function(){
    var self = this;
    slots.on("all", function(){
      self.isMounted() && self.forceUpdate();
    });
  },
  getInitialState: function(){
    return {showAdd: false, first: true};
  },

  setTimezone: function(tz){
    Actions.setTimezone(moment.tz.zone(tz));
  },

  onCloseAdd: function(){
    this.setState({showAdd: false});
  },

  onCloseFirst: function(){
    this.setState({first: false});
  },

  removeSlot: function(slot){
    var slotText = _displaySlot(slot, user.get("timezone"), true);
    if (confirm("Really remove "+ slotText + "?")){
      Actions.removeCallSlot(slot);
    }
  },

  showAddMany: function (argument) {
    this.setState({showAdd: 'many'});
  },

  showAdd: function(){
    this.setState({showAdd: true});
  },

  clearSlots: function(){
    if (confirm("Should we really purge all existing slots?")){
      Actions.clearCallSlots();
    }
  },

  render: function() {
    if (!user.get("timezone")){
      return <TimezoneSelector setTimezone={this.setTimezone} />;
    }

    if (!slots.models.length && this.state.first){
      var zone = user.get("timezone");
      return (<Grid>
          <p style={{color:"purple"}}><em>All information rendered with 24h format. TIMEZONE: {zone}</em></p>
                <Row>
                  <h2>Welcome</h2>
                  <p>Please let us know about your call availability</p>
                </Row>
                <Row>
                  <AddMany onClose={this.onCloseFirst} zone={zone} />
                </Row>
              </Grid>);
    }

    var zone = user.get("timezone"),
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
        days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"],
        regularSlotsElems = _.map(_.sortBy(_.keys(slotGroups),
                                              function(x) {return x}),
                              function(day){
                                var dt = <h3>{days[day]}</h3>,
                                    slotData = slotGroups[day];
                                return (
                                        <Panel key={day} header={dt}>
                                          <ButtonToolbar>
                                            {_.map(slotData, function(slot){
                                                return <Button btSize='large' bsStyle="info"
                                                            onClick={function(x){self.removeSlot(slot)}}
                                                            key={slot.ts.format('LLLL')}>{_displaySlot(slot, zone)}</Button>
                                                })
                                            }
                                            </ButtonToolbar>
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
        callSlots = (user.get("calls").length ?
                          _.filter(user.get("calls"), function(call){
                                    return !call.failed && moment(call.scheduledAt) > moment();
                                  }) : []),
        callSlotElems = (callSlots.length ? _.map(callSlots, function(call){
                              var callers = _.pluck(call.callers, 'name').join(", ");
                              return <li key={call.scheduledAt}>
                                      <em>{_displayCall(call, zone)}</em>
                                      <br/> Application #{call.application}
                                      <br/> skype: @{call.skype_name}
                                      <br/> {callers}</li>
                            }) : <li><em>No upcoming calls at the moment</em></li>),
        showAdd;

    if (this.state.showAdd == 'many'){
      showAdd = <AddMany onClose={this.onCloseAdd} zone={zone} />;
    } else if (this.state.showAdd){
      showAdd = <AddSlot onClose={this.onCloseAdd} />;
    } else {
      showAdd = <ButtonToolbar><Button bsStyle="success" onClick={this.showAdd}>+ Add Timeslot </Button>
                     <Button bsStyle="success" onClick={this.showAddMany}>+ Add Regulars </Button>
                     <Button bsStyle="warning" bsSize="xsmall" onClick={this.clearSlots}> clear all</Button>
                </ButtonToolbar>;
    }

    return (<div className="main-container">
              <Grid>
              <Row>
                  <p style={{color:"purple"}}><em>All information rendered with 24h format. TIMEZONE: {zone}</em></p>
                </Row>
                <Row>
                  <Col xs={12} md={8}>
                    {showAdd}
                    <div className="cal-elem">
                      <h3>One time Slots</h3>
                      <p>click to remove</p>
                      <ul>
                        {onceSlotElems}
                      </ul>
                    </div>
                    <div className="cal-elem">
                      <h3>Regular Slots</h3>
                        <p>click to remove</p>
                        {regularSlotsElems}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <h3>Upcoming calls</h3>
                    <ul>
                      {callSlotElems}
                    </ul>
                    <SuggestedSlots />
                  </Col>
                </Row>
              </Grid>
            </div>)
    ;
  }
});

module.exports = CallSlots;
