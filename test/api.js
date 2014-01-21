var test = require('tape');
var api  = require('../index.js');

test('API signature', function(t) {
  t.plan(2);

  t.strictEqual(api.Entity, require('../lib/Entity.js'));
  t.strictEqual(api.EntityManager, require('../lib/EntityManager.js'));

});
