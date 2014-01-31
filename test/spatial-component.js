var test = require('tape');
var Spatial = require('../lib/Spatial.js');

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
  t.plan(6);

  var parent = new Spatial();
  parent.scale.set(2, 3);

  var child = new Spatial();
  child.scale.set(4, 5);

  var grandChild = new Spatial();
  grandChild.scale.set(1/4, 1/3);

  // Mock injected entities
  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absScale().x, 2);
  t.strictEqual(parent.absScale().y, 3);
  t.strictEqual(child.absScale().x, 8);
  t.strictEqual(child.absScale().y, 15);
  t.strictEqual(grandChild.absScale().x, 2);
  t.strictEqual(grandChild.absScale().y, 5);
});

test('Abs rotation', function(t) {
  t.plan(3);

  var parent = new Spatial();
  parent.rotation = 0.3;

  var child = new Spatial();
  child.rotation = 0.4;

  var grandChild = new Spatial();
  grandChild.rotation = 0.5;

  // Mock injected entities
  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absRotation(), 0.3);
  t.strictEqual(child.absRotation(), 0.7);
  t.strictEqual(grandChild.absRotation(), 1.2);
});

test('abs location identity', function(t) {
  t.plan(6);

  var parent = new Spatial();
  var child = new Spatial();
  var grandChild = new Spatial();

  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absPosition(), parent.absPosition());
  t.strictEqual(child.absPosition(), child.absPosition());
  t.strictEqual(grandChild.absPosition(), grandChild.absPosition());

  t.notStrictEqual(parent.absPosition(), child.absPosition());
  t.notStrictEqual(grandChild.absPosition(), child.absPosition());
  t.notStrictEqual(parent.absPosition(), grandChild.absPosition());
});

test('abs scale identity', function(t) {
  t.plan(6);

  var parent = new Spatial();
  var child = new Spatial();
  var grandChild = new Spatial();
  mockEntities(parent, child, grandChild);

  t.strictEqual(parent.absScale(), parent.absScale());
  t.strictEqual(child.absScale(), child.absScale());
  t.strictEqual(grandChild.absScale(), grandChild.absScale());

  t.notStrictEqual(parent.absScale(), child.absScale());
  t.notStrictEqual(grandChild.absScale(), child.absScale());
  t.notStrictEqual(parent.absScale(), grandChild.absScale());
});

test('abs location, no rot no scale', function(t) {
  t.plan(3);

  var parent = new Spatial();
  var child = new Spatial();
  var grandChild = new Spatial();
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

  var parent = new Spatial();
  var child = new Spatial();
  var grandChild = new Spatial();
  mockEntities(parent, child, grandChild);

  parent.position.set(1, 2);
  parent.scale.set(2, 3);

  child.position.set(3, 4);
  child.scale.set(3, 4);

  grandChild.position.set(5, 6);

  t.deepEqual(parent.absPosition(), {x: 1, y: 2});
  t.deepEqual(child.absPosition(), {x: 7, y: 14});
  t.deepEqual(grandChild.absPosition(), {x: 37, y: 86});
});

test('abs position with rotation', function(t) {
  t.plan(3);

  var parent = new Spatial();
  var child = new Spatial();
  var grandChild = new Spatial();
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


