var test          = require('tape');
var EntityManager = require('../lib/EntityManager.js');

test('Entity create', function(t) {
  var m = new EntityManager();

  m.createEntity();

  t.end()
});

test('Entity remove', function(t) {
  var m = new EntityManager();

  m.createEntity().remove();

  t.end()
});

test('Component add', function(t) {
  t.plan(4);

  function C() { }

  var m = new EntityManager();

  var entity = m.createEntity()

  entity.on('component added', function(T) {
      t.pass('made it');
      t.strictEqual(entity._manager, m);
      t.strictEqual(T, C);
      t.strictEqual(m.count(), 1);
  });
  
  entity.addComponent(C);
});

test('Component remove', function(t) {
  t.plan(6);

  function C() { }

  var m = new EntityManager();

  var entity = m.createEntity()

  entity.on('component added', function(T) {
      t.strictEqual(entity._manager, m);
      t.strictEqual(T, C);
      t.strictEqual(m.count(), 1);
  });

  entity.on('component removed', function(T) {
      t.pass('made it');
      t.strictEqual(entity._manager, m);
      t.strictEqual(T, C);
  });

  entity.addComponent(C).removeComponent(C);
});

