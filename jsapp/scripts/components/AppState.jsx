
var React = require('react/addons'),
    _ = require('underscore'),
    Actions = require('../actions/actions'),
    {Glyphicon}  = require('react-bootstrap'),
    {appstate} = require('../stores/AppStateStore');


module.exports = {AppState: React.createClass({

  componentWillMount: function() {

    var self = this;
    appstate.on("all", function(){
      self.forceUpdate();
    });

    setInterval(function() {
      self.isMounted() && self.forceUpdate()
    }, 3000) // refresh every 3 seconds
  },


  render() {
    if (appstate.get("loading")){
      return <span>Reloading</span>;
    }
    ;
    return <span className="refresher">Last updated: <br/> {appstate.get("last_updated").fromNow()} </span>
  }

})};