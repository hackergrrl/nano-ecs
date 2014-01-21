var EntityManager = require('../lib/EntityManager.js');
var test = require('tape');

test('Add and remove tags', function(t) {
  t.plan(12);

  var entities = new EntityManager();
  var tag  = 't';
  var tag2 = 't2';

  var e1 = entities.createEntity();
  var e2 = entities.createEntity();

  entities.entityAddTag(e1, tag);
  t.deepEqual(e1._tags, [tag]);
  t.deepEqual(entities.queryTag(tag), [e1]);
  t.deepEqual(entities.queryTag(tag2), entities.queryTag(tag2));

  entities.entityAddTag(e1, tag2);
  t.deepEqual(e1._tags, [tag, tag2]);
  t.deepEqual(entities.queryTag(tag), [e1]);
  t.deepEqual(entities.queryTag(tag2), [e1]);

  entities.entityAddTag(e2, tag);
  t.deepEqual(entities.queryTag(tag), [e1, e2]);
  t.deepEqual(entities.queryTag(tag2), [e1]);

  entities.entityRemoveTag(e1, tag);
  t.deepEqual(e1._tags, [tag2]);
  t.deepEqual(entities.queryTag(tag), [e2]);
  entities.entityRemoveTag(e1, tag);
  entities.entityRemoveTag(e2, tag);
  t.deepEqual(entities.queryTag(tag), []);
  t.deepEqual(e2._tags, []);

});

test('Adding and removing entities with tags', function(t) {
  t.plan(4);

  var entities = new EntityManager();
  var tag  = 't';
  var tag2 = 't2';

  var e1 = entities.createEntity();
  var e2 = entities.createEntity();

  entities.entityAddTag(e1, tag);
  entities.entityAddTag(e1, tag2);
  entities.entityAddTag(e2, tag2);

  t.deepEqual(entities.queryTag(tag), [e1]);
  t.deepEqual(entities.queryTag(tag2), [e1, e2]);
  entities.removeEntity(e1);
  t.deepEqual(entities.queryTag(tag), []);
  t.deepEqual(entities.queryTag(tag2), [e2]);


});
