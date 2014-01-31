var test = require('tape');
var Vec2 = require('../lib/Vec2.js');

test('Basic mutators', function(t) {
  t.plan(24);

  function checkV(v, x, y) {
    t.strictEqual(v.x.toFixed(3), x.toFixed(3));
    t.strictEqual(v.y.toFixed(3), y.toFixed(3));
  }

  checkV(new Vec2(), 0, 0);
  checkV(new Vec2(1, 2), 1, 2);
  checkV(new Vec2().set(3,4), 3, 4);
  checkV(new Vec2().assign(new Vec2(5, 6)), 5, 6);
  checkV(new Vec2(1,2).clear(), 0, 0);

  checkV(new Vec2(0,5).limit(4), 0, 4);
  checkV(new Vec2(3,0).normalize(), 1, 0);
  checkV(new Vec2(3,0).normalize(0.5), 0.5, 0);
  checkV(new Vec2(1,2).sub(new Vec2(2, 1)), -1, 1);
  checkV(new Vec2(3,4).add(new Vec2(4, 5)), 7, 9);

  checkV(new Vec2(2,3).smult(0.5), 1, 1.5);
  checkV(new Vec2(1,0).rotate(Math.PI), -1, 0);

});

test('Basic calculations', function(t) {
  t.plan(11);

  t.strictEqual(new Vec2(2,3).dot(new Vec2(4,5)), 23);
  t.strictEqual(new Vec2(2,3).det(new Vec2(4,5)), -2);
  t.strictEqual(new Vec2(0,3).magnitude(), 3);
  t.strictEqual(new Vec2(3,0).magnitude(), 3);
  t.strictEqual(new Vec2(0,-3).magnitude(), 3);
  t.strictEqual(new Vec2(-3,0).magnitude(), 3);

  t.strictEqual(new Vec2(0,3).magnitude2(), 9);
  t.strictEqual(new Vec2(3,0).magnitude2(), 9);

  t.strictEqual(new Vec2(1,0).angleBetween(new Vec2(0,1)), Math.PI/2);
  t.strictEqual(new Vec2(0,1).angleBetween(new Vec2(-1,0)), Math.PI/2);
  t.strictEqual(new Vec2(-1,0).angleBetween(new Vec2(0,-1)), Math.PI/2);

});

test('Basic construction', function(t) {
  t.plan(7);

  function checkV(v, x, y) {
    t.strictEqual(v.x.toFixed(3), x.toFixed(3));
    t.strictEqual(v.y.toFixed(3), y.toFixed(3));
  }

  checkV(Vec2.fromAngle(Math.PI), -1, 0);
  checkV(Vec2.fromAngle(Math.PI, 3), -3, 0);
  var v = new Vec2(1,3);
  var u = v.copy();
  checkV(u, 1, 3);
  t.notStrictEqual(v, u);

});

test('Pool semantics', function(t) {
  t.plan(6);

  var a = Vec2.aquire();
  t.strictEqual(Vec2.release(), 1);
  Vec2.release(a);
  t.strictEqual(Vec2.release(), 0);
  a = Vec2.aquire(1,2);
  var b = a.pcopy();
  t.strictEqual(Vec2.release(), 2);
  t.strictEqual(a.x, b.x);
  t.strictEqual(a.y, b.y);
  Vec2.release(a);
  Vec2.release(b);
  t.strictEqual(Vec2.release(), 0);

});
