var test      = require('tape');
var Messanger = require('../lib/Messanger.js');

function mockEntity(Comps) {
  Comps = Comps || [];
  return {
    hasAllComponents: function(C) {
      var hasAll = true;
      C.forEach(function(T) { hasAll = hasAll && !!~Comps.indexOf(T); });
      return hasAll;
    }
  };
}

test('Messanger, basic triggering', function(t) {
  t.plan(2);

  var m = new Messanger();

  m.listenTo('event', function() { t.pass('fired'); });

  m.trigger('event');
  m.trigger('none');
  m.trigger('event');

});

test('With entity and option', function(t) {
  t.plan(2);

  var O = {};
  var E = {};

  var m = new Messanger();
  m.listenTo('event', function(entity, option) {
    t.strictEqual(entity, E);
    t.strictEqual(option, O);
  });

  m.trigger('event', E, O);

});

test('With component filter', function(t) {
  t.plan(3);

  function C1() { }
  function C2() { }

  var m = new Messanger();

  m.listenTo('event', function() { t.pass('made it'); })
    .whereComponents([C1, C2]);

  m.trigger('event', mockEntity([C1, C2]));
  m.trigger('event', mockEntity());
  m.trigger('event', mockEntity([C2, C1]));

  m.listenTo('another', function() { t.pass('made it'); })
    .whereComponents([C2]);

  m.trigger('another', mockEntity([C1]));
  m.trigger('another', mockEntity([]));
  m.trigger('another', mockEntity([C1, C2]));

});

