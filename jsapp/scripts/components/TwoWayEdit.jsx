/**
 * @jsx React.DOM
 */

'use strict';

var React = require('react/addons'),
  {Button}  = require('react-bootstrap'),
  {user} = require('../stores/UserStore');


var TwoWayEdit = React.createClass({
	getInitialState: function(){
		return{'editMode': false};
	},

	editPressed: function(){
		this.setState({editMode: true});
	},

	render: function(){
		if (this.state.editMode){
			return(
				<div>{React.createElement(this.props.editComp, this.props)}</div>
				)
		}

		return(
			<div><Button onClick={this.TwoWayEdit}>Edit</Button>
			{React.createElement(this.props.displayComp, this.props)}
			</div>)
	}
});

module.exports = {TwoWayEdit: TwoWayEdit};