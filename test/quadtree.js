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

function rando(m) { return Math.random(1234)*m - m/2; }

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

test('add / split / query / combine', function(t) {
  t.plan(11);

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

  tree._combine();
  t.deepEqual(tree.entities, [e3, e, e2]);

});

test('pool fidelity', function(t) {
  t.plan(5);

  var tree = new QuadTree();

  t.strictEqual(tree.pool.totalUsed(), 0, 'empty');

  var size = 5000;
  var fat = 100;

  // offset
  tree.size.set(size, size);
  tree.position.set(-size/2, -size/2);

  function fillTree() {
    var list = [];
    for (var x = 0; x < 1000; x++) {
      var e = mockEntity(rando(size), rando(size), rando(fat), rando(fat));
      list.push(e);
      tree.insert(e);
    }

    return list;
  }

  fillTree();
  tree.clear();
  t.strictEqual(tree.pool.totalUsed(), 0);

  var list = fillTree();
  list.forEach(function(e) { tree.remove(e); });
  tree.reIndex();

  // We will naturally have 4 left over, but all nodes are empty
  t.strictEqual(tree.pool.totalUsed(), 0);
  t.strictEqual(tree.nodes.length, 0);
  t.deepEqual(tree.entities, []);

});
