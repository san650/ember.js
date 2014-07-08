requireModule('ember-metal');
requireModule('ember-runtime');
requireModule('ember-handlebars-compiler');
requireModule('ember-handlebars');
requireModule('ember-views');
requireModule('ember-routing');
requireModule('ember-application');
requireModule('ember-extension-support');

var App, container, router;

module("Application Lifecycle", {
  setup: function() {
    Ember.run(function() {
      App = Ember.Application.create({
        rootElement: '#qunit-fixture'
      });

      App.Router.extend({
        location: 'none'
      });

      App.deferReadiness();

      container = App.__container__;
    });
  },

  teardown: function() {
    router = null;
    Ember.run(App, 'destroy');
  }
});

function handleURL(path) {
  router = container.lookup('router:main');
  return Ember.run(function() {
    return router.handleURL(path).then(function(value) {
      ok(true, 'url: `' + path + '` was handled');
      return value;
    }, function(reason) {
      ok(false, reason);
      throw reason;
    });
  });
}


test("Resetting the application allows controller properties to be set when a route deactivates", function() {
  App.Router.map(function() {
    this.route('home', { path: '/' });
  });

  App.HomeRoute = Ember.Route.extend({
    setupController: function() {
      this.controllerFor('home').set('selectedMenuItem', 'home');
    },
    deactivate: function() {
      this.controllerFor('home').set('selectedMenuItem', null);
    }
  });
  App.ApplicationRoute = Ember.Route.extend({
    setupController: function() {
      this.controllerFor('application').set('selectedMenuItem', 'home');
    },
    deactivate: function() {
      this.controllerFor('application').set('selectedMenuItem', null);
    }
  });

  var router = container.lookup('router:main');

  Ember.run(App, 'advanceReadiness');

  handleURL('/');

  equal(Ember.controllerFor(container, 'home').get('selectedMenuItem'), 'home');
  equal(Ember.controllerFor(container, 'application').get('selectedMenuItem'), 'home');

  App.reset();

  equal(Ember.controllerFor(container, 'home').get('selectedMenuItem'), null);
  equal(Ember.controllerFor(container, 'application').get('selectedMenuItem'), null);
});

test("Destroying the application resets the router before the container is destroyed", function() {
  App.Router.map(function() {
    this.route('home', { path: '/' });
  });

  App.HomeRoute = Ember.Route.extend({
    setupController: function() {
      this.controllerFor('home').set('selectedMenuItem', 'home');
    },
    deactivate: function() {
      this.controllerFor('home').set('selectedMenuItem', null);
    }
  });
  App.ApplicationRoute = Ember.Route.extend({
    setupController: function() {
      this.controllerFor('application').set('selectedMenuItem', 'home');
    },
    deactivate: function() {
      this.controllerFor('application').set('selectedMenuItem', null);
    }
  });

  var router = container.lookup('router:main');

  Ember.run(App, 'advanceReadiness');

  handleURL('/');

  equal(Ember.controllerFor(container, 'home').get('selectedMenuItem'), 'home');
  equal(Ember.controllerFor(container, 'application').get('selectedMenuItem'), 'home');

  Ember.run(App, 'destroy');

  equal(Ember.controllerFor(container, 'home').get('selectedMenuItem'), null);
  equal(Ember.controllerFor(container, 'application').get('selectedMenuItem'), null);
});
