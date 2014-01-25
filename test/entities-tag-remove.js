var EntityManager = require('../lib/EntityManager.js');
var test = require('tape');

test('Case', function(t) {
  t.plan(4);

  var m = new EntityManager();

  for (var x = 0; x < 20; x++) {
    var e = m.createEntity()
      .addTag('a')
      .addTag('b')
      .addTag('c');
  }

  var tagged = m.queryTag('a');
  t.strictEqual(tagged.length, 20);

  m.removeEntitiesByTag('a');


  t.deepEqual(m.queryTag('a'), []);
  t.deepEqual(m.queryTag('b'), []);
  t.deepEqual(m.queryTag('c'), []);

});
