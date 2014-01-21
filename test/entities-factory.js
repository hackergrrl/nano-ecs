var EntityManager = require('../lib/EntityManager.js');


var test = require('tape');

test('Factory for entities', function(t) {
  t.plan(2);

  var LOL = {};
  function factory(T) {
    t.pass('factory fired');
    return LOL;
  }

  var entities = new EntityManager(factory);

  t.strictEqual(entities.createEntity(), LOL);

});

test('Recycler for entities', function(t) {
  t.plan(1);

  function recycle(instance) {
    t.pass('recycle called');
  }

  var entities = new EntityManager(null, recycle);

  entities.removeEntity(entities.createEntity());

});

test('Recycler for components', function(t) {
  t.plan(5);

  function recycle(instance) {
    t.pass('recycle called');
  }

  function C() { }
  function D() { }

  var entities = new EntityManager(null, recycle);

  entities.createEntity()
    .addComponent(C)
    .addComponent(D)
    .removeComponent(C)
    .removeComponent(C)
    .removeComponent(D)
    ;

  entities.createEntity()
    .addComponent(C)
    .addComponent(D)
    .remove()
    ;

});
