var EntityManager = require('../lib/EntityManager.js');

var test = require('tape');

test('Adding and removing entities', function(t) {
  t.plan(5);

  var entities = new EntityManager();

  t.strictEqual(entities.count(), 0);
  var e1 = entities.createEntity();
  t.strictEqual(entities.count(), 1);
  var e2 = entities.createEntity();
  t.strictEqual(entities.count(), 2);
  entities.removeEntity(e1);
  t.strictEqual(entities.count(), 1);
  entities.removeEntity(e2);
  t.strictEqual(entities.count(), 0);

});

test('Adding components to entity and querying', function(t) {
  t.plan(11);

  var entities = new EntityManager();
  function C() { }
  function D() { }

  var entity = entities.createEntity();

  entities.entityAddComponent(entity, C);
  t.ok(entity.c instanceof C, 'added');
  t.deepEqual(entities.queryComponents([C]), [entity]);
  entities.entityAddComponent(entity, C);
  t.deepEqual(entities.queryComponents([C]), [entity]);

  entities.entityAddComponent(entity, D);
  t.ok(entity.d instanceof D, 'added');
  t.deepEqual(entities.queryComponents([C]), [entity]);
  t.deepEqual(entities.queryComponents([C,D]), [entity]);
  t.deepEqual(entities.queryComponents([D,C]), [entity]);

  entities.entityRemoveComponent(entity, D);
  t.deepEqual(entities.queryComponents([C]), [entity]);
  t.deepEqual(entities.queryComponents([C,D]), []);
  t.deepEqual(entities.queryComponents([D]), []);

  entities.entityRemoveComponent(entity, C);
  t.deepEqual(entities.queryComponents([C]), []);

});

test('Removing entities and querying on components', function(t) {
  t.plan(4);

  var entities = new EntityManager();
  function C() { }
  function D() { }

  var e1 = entities.createEntity();
  entities.entityAddComponent(e1, C);
  entities.entityAddComponent(e1, D);
  t.deepEqual(entities.queryComponents([D,C]), [e1]);

  var e2 = entities.createEntity();
  entities.entityAddComponent(e2, C);
  entities.entityAddComponent(e2, D);
  t.deepEqual(entities.queryComponents([D,C]), [e1, e2]);

  entities.removeEntity(e1);
  t.deepEqual(entities.queryComponents([D,C]), [e2]);
  entities.removeEntity(e2);
  t.deepEqual(entities.queryComponents([D,C]), []);

});

test('Throw in incorrect entity removal', function(t) {
  t.plan(1);

  var entities = new EntityManager();
  var e1 = entities.createEntity();
  entities.removeEntity(e1);
  t.throws(function() {
    entities.removeEntity(e1);
  });

});

