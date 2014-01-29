var test          = require('tape');
var EntityManager = require('../lib/EntityManager.js');

test('Entity create', function(t) {
  t.plan(3);

  var mock = {
    trigger: function(event, entity) {
      t.pass('made it');
      t.strictEqual(event, EntityManager.ENTITY_CREATED);
      t.strictEqual(entity._manager, m);
    }
  };

  var m = new EntityManager(mock);

  m.createEntity();

});

test('Entity remove', function(t) {
  t.plan(4);

  var mock = {
    trigger: function(event, entity) {
      if (event !== EntityManager.ENTITY_REMOVE) return;
      t.pass('made it');
      t.strictEqual(event, EntityManager.ENTITY_REMOVE);
      t.strictEqual(entity._manager, m);

      // entity is still in pool
      t.strictEqual(m.count(), 1);
    }
  };

  var m = new EntityManager(mock);

  m.createEntity().remove();

});

test('Component add', function(t) {
  t.plan(4);

  function C() { }

  var mock = {
    trigger: function(event, entity, T) {
      if (event !== EntityManager.COMPONENT_ADDED) return;
      t.pass('made it');
      t.strictEqual(entity._manager, m);
      t.strictEqual(T, C);
      t.strictEqual(m.count(), 1);
    }
  };

  var m = new EntityManager(mock);

  m.createEntity().addComponent(C);
});

test('Component remove', function(t) {
  t.plan(10);

  function C() { }

  var count = 1;

  var mock = {
    trigger: function(event, entity, T) {
      if (event !== EntityManager.COMPONENT_REMOVE) return;
      t.pass('made it');
      t.strictEqual(entity._manager, m);
      t.strictEqual(T, C);
      t.strictEqual(m.count(), count++);

      // still there
      t.ok(entity.c instanceof T);
    }
  };

  var m = new EntityManager(mock);

  m.createEntity().addComponent(C).removeComponent(C);
  m.createEntity().addComponent(C).remove();
});

