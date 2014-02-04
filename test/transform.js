var test = require('tape');
var Transform = require('../lib/Transform.js');

function mockEntities(parent, child, grandChild)
{
  child.parent = parent;
  grandChild.parent = child;
}

function vEq(a, b) {
  var ep = 0.001;
  return Math.abs(a.x - b.x) < ep && Math.abs(a.y - b.y) < ep;
}

test('Abs scale', function(t) {
  t.plan(3);

  var parent = new Transform();
  parent.scale = 2;

  var child = new Transform();
  child.scale = 4;

  var grandChild = new Transform();
  grandChild.scale = 1/4;

  // Mock injected entities
  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absScale(), 2);
  t.strictEqual(child.absScale(), 8);
  t.strictEqual(grandChild.absScale(), 2);
});

test('Abs rotation', function(t) {
  t.plan(3);

  var parent = new Transform();
  parent.rotation = 0.3;

  var child = new Transform();
  child.rotation = 0.4;

  var grandChild = new Transform();
  grandChild.rotation = 0.5;

  // Mock injected entities
  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absRotation(), 0.3);
  t.strictEqual(child.absRotation(), 0.7);
  t.strictEqual(grandChild.absRotation(), 1.2);
});

test('abs location identity', function(t) {
  t.plan(6);

  var parent = new Transform();
  var child = new Transform();
  var grandChild = new Transform();

  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absPosition(), parent.absPosition());
  t.strictEqual(child.absPosition(), child.absPosition());
  t.strictEqual(grandChild.absPosition(), grandChild.absPosition());

  t.notStrictEqual(parent.absPosition(), child.absPosition());
  t.notStrictEqual(grandChild.absPosition(), child.absPosition());
  t.notStrictEqual(parent.absPosition(), grandChild.absPosition());
});

test('abs location, no rot no scale', function(t) {
  t.plan(3);

  var parent = new Transform();
  var child = new Transform();
  var grandChild = new Transform();
  mockEntities(parent, child, grandChild);

  parent.position.set(1, 2);
  child.position.set(3, 4);
  grandChild.position.set(5, 6);

  t.deepEqual(parent.absPosition(), {x: 1, y: 2});
  t.deepEqual(child.absPosition(), {x: 4, y: 6});
  t.deepEqual(grandChild.absPosition(), {x: 9, y: 12});
});

test('abs location + scale', function(t) {
  t.plan(3);

  var parent = new Transform();
  var child = new Transform();
  var grandChild = new Transform();
  mockEntities(parent, child, grandChild);

  parent.position.set(1, 2);
  parent.scale = 2;

  child.position.set(3, 4);
  child.scale = 3;

  grandChild.position.set(5, 6);

  t.deepEqual(parent.absPosition(), {x: 1, y: 2});
  t.deepEqual(child.absPosition(), {x: 7, y: 10});
  t.deepEqual(grandChild.absPosition(), {x: 37, y: 46});
});

test('abs position with rotation', function(t) {
  t.plan(3);

  var parent = new Transform();
  var child = new Transform();
  var grandChild = new Transform();
  mockEntities(parent, child, grandChild);

  parent.position.set(1,0);
  parent.rotation = Math.PI/2;

  child.position.set(0, 1);
  child.rotation = Math.PI/2;

  grandChild.position.set(-1, 0);

  t.deepEqual(parent.absPosition(), {x: 1, y: 0});
  t.ok(vEq(child.absPosition(), {x: 0, y: 0}));
  t.ok(vEq(grandChild.absPosition(), {x: 1, y: 0}));
});


