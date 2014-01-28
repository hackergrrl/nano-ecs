var test     = require('tape');
var QuadTree = require('../lib/QuadTree.js');

function mockEntity(x, y, w, h)
{
  return {
    spatial: {
      absPosition: function() { return { x: x, y: y }; },
      absHwidth: function() { return { x: w, y: h }; }
    }
  };
}

function mockVec(x, y) { return {x: x, y: y}; }

test('internal stuff', function(t) {
  t.plan(1);

  var tree = new QuadTree();
  tree.size.set(100,100);
  tree.position.set(50, 50);
  tree.maxEntities = 1;

  var e = mockEntity(-20, -20, 5, 5);
  tree.insert(e);

  t.deepEqual(tree.entities, [e], 'arrayed');

});

test('split and redist', function(t) {
  t.plan(10);

  var tree = new QuadTree();
  tree.size.set(100,100);
  tree.position.set(-50, -50);
  tree.maxEntities = 1;

  var e = mockEntity(-20, -20, 5, 5);
  tree.insert(e);

  var e2 = mockEntity(-20, 20, 5, 5);
  tree.insert(e2);

  t.deepEqual(tree.entities, [], 'none');
  t.deepEqual(tree.nodes[0].entities, [], 'none');
  t.deepEqual(tree.nodes[1].entities, [e], 'none');
  t.deepEqual(tree.nodes[2].entities, [e2], 'none');
  t.deepEqual(tree.nodes[3].entities, [], 'none');

  var e3 = mockEntity(0, 0, 10, 10);
  tree.insert(e3);
  t.deepEqual(tree.entities, [e3]);

  t.deepEqual(tree.queryArea(mockVec(-40, -40), mockVec(5,5)), []);
  t.deepEqual(tree.queryArea(mockVec(-40, 40), mockVec(5,5)), []);
  t.deepEqual(tree.queryArea(mockVec(-22, 17), mockVec(10,10)), [e2]);
  t.deepEqual(tree.queryArea(mockVec(0,0), mockVec(5,5)), [e3]);

});
