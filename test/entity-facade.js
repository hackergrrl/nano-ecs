var EntityManager = require('../lib/EntityManager.js');
var Entity   = require('../lib/Entity.js');
var test     = require('tape');

test('Add / remove components', function(t) {
  t.plan(11);

  var entities = new EntityManager();
  function C() { }
  function D() { }

  var e1 = entities.createEntity();

  e1.addComponent(C);
  t.ok(e1.c instanceof C, 'added');
  t.deepEqual(entities.queryComponents([C]), [e1]);
  e1.addComponent(D);
  t.deepEqual(entities.queryComponents([C]), [e1]);

  e1.addComponent(D);
  t.ok(e1.d instanceof D, 'added');
  t.deepEqual(entities.queryComponents([C]), [e1]);
  t.deepEqual(entities.queryComponents([C,D]), [e1]);
  t.deepEqual(entities.queryComponents([D,C]), [e1]);

  e1.removeComponent(D);
  t.deepEqual(entities.queryComponents([C]), [e1]);
  t.deepEqual(entities.queryComponents([C,D]), []);
  t.deepEqual(entities.queryComponents([D]), []);

  e1.removeComponent(C);
  t.deepEqual(entities.queryComponents([C]), []);

});

test('Add / remove tags', function(t) {

  t.plan(12);

  var entities = new EntityManager();
  var tag  = 't';
  var tag2 = 't2';

  var e1 = entities.createEntity();
  var e2 = entities.createEntity();

  e1.addTag(tag);
  t.deepEqual(e1._tags, [tag]);
  t.deepEqual(entities.queryTag(tag), [e1]);

  e1.addTag(tag2);
  t.deepEqual(e1._tags, [tag, tag2]);
  t.deepEqual(entities.queryTag(tag), [e1]);
  t.deepEqual(entities.queryTag(tag2), [e1]);
  t.deepEqual(entities.queryTag(tag2), entities.queryTag(tag2));

  e2.addTag(tag);
  t.deepEqual(entities.queryTag(tag), [e1, e2]);
  t.deepEqual(entities.queryTag(tag2), [e1]);

  e1.removeTag(tag);
  t.deepEqual(e1._tags, [tag2]);
  t.deepEqual(entities.queryTag(tag), [e2]);
  e1.removeTag(tag);
  e2.removeTag(tag);
  t.deepEqual(entities.queryTag(tag), []);
  t.deepEqual(e2._tags, []);

});
