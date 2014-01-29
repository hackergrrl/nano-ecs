var test = require('tape');
var api  = require('../index.js');

test('API signature', function(t) {
  t.plan(6);

  t.strictEqual(api.Entity, require('../lib/Entity.js'));
  t.strictEqual(api.EntityManager, require('../lib/EntityManager.js'));
  t.strictEqual(api.ObjectPool, require('../lib/ObjectPool.js'));
  t.strictEqual(api.QuadTree, require('../lib/QuadTree.js'));
  t.strictEqual(api.Spatial, require('../lib/Spatial.js'));
  t.strictEqual(api.Vec2, require('../lib/Vec2.js'));

});
