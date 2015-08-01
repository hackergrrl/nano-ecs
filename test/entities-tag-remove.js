var test = require('tape')
var nano = require('../index')

test('Case', function (t) {
  t.plan(4)

  var m = nano()

  for (var x = 0; x < 20; x++) {
    m.createEntity()
      .addTag('a')
      .addTag('b')
      .addTag('c')
  }

  var tagged = m.queryTag('a')
  t.strictEqual(tagged.length, 20)

  m.removeEntitiesByTag('a')

  t.deepEqual(m.queryTag('a'), [])
  t.deepEqual(m.queryTag('b'), [])
  t.deepEqual(m.queryTag('c'), [])

})
