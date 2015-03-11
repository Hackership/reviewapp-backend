'use strict';

describe('Main', function () {
  var React = require('react/addons');
  var ReviewsappApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    ReviewsappApp = require('components/ReviewsappApp.js');
    component = React.createElement(ReviewsappApp);
  });

  it('should create a new instance of ReviewsappApp', function () {
    expect(component).toBeDefined();
  });
});
