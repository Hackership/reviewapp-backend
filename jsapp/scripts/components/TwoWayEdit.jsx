/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
   _ = require('underscore'),
  {Button, Col, Row}  = require('react-bootstrap'),
  {user} = require('../stores/UserStore');


var TwoWayEdit = React.createClass({
	getInitialState: function(){
		return{'editMode': false};
	},

	editPressed: function(){
		this.setState({editMode: true});
	},

	resetEdit: function(){
		this.setState({editMode: false});
	},

	render: function(){
		var child_props = _.extend({cancelEdit: this.resetEdit}, this.props);
		var edit_button = this.props.visible? <Button onClick={this.editPressed} bsStyle="info" bsSize="small">Edit</Button> : "";
		if (this.state.editMode){
			return(
				<div>{React.createElement(this.props.editComp, child_props)}</div>
				)
		}

		return(
			<div className="editComp">
			<Row>
				<Col xs={8}>
					{React.createElement(this.props.displayComp, child_props)}
				</Col>
				<Col xs={3} xs-offset={1}>
					{edit_button}
				</Col>
			</Row>
			</div>)
	}
});

module.exports = {TwoWayEdit: TwoWayEdit};