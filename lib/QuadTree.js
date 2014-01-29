module.exports = QuadTree;

var ObjectPool = require('./ObjectPool.js');
var Spatial    = require('./Spatial.js');
var Vec2       = require('./Vec2.js');

/**
 * Effectively store positional and sized objects. Each tree has a position and
 * size, as well as up to 4 child nodes (other trees) and an array of entries.
 * @constructor
 */
function QuadTree()
{
  this.level       = 0;
  this.position    = new Vec2();
  this.size        = new Vec2();
  this.maxEntities = 15;
  this.maxLevels   = 10;

  /**
   * Pool that is used for all internal quad trees. Only root node has one, all
   * others have a refence.
   */
  this.pool = new ObjectPool(QuadTree);

  /**
   * @type {Array.<QuadTree>}
   */
  this.nodes = [];

  /**
   * @type {Array.<{spatial: Spatial}>}
   */
  this.entities = [];
}

/**
 * Reset for pool.
 * @private
 */
QuadTree.prototype.__init = function()
{
  this.level = 0;
  this.position.clear();
  this.size.clear();
  this.nodes.length = 0;
  this.entities.length = 0;

  // Only root node has actual ref to pool
  this.pool = null;
};

/**
 * Add an entity to the tree
 * @param {{spatial: Spatial}} entity
 */
QuadTree.prototype.insert = function(entity)
{
  // Recurse if we can
  if (this.nodes.length) {
    var index = this._getIndex(entity.spatial.absPosition(),
      entity.spatial.absHwidth());
    if (~index) return this.nodes[index].insert(entity);
  }

  // Actually add the entity
  this.entities.push(entity);
  this._splitAndRedistributeIfNeeded();
  entity.spatial._node = this;
  return entity;
};

/**
 * Remove an entity from this tree.
 * @param {{spatial: Spatial}} param
 */
QuadTree.prototype.remove = function(entity)
{
  // Remove if we can
  var n = this.entities.indexOf(entity);
  if (~n) {
    this.entities.splice(n, 1);
    entity.spatial._node = null;
    if (!this.totalSize())
      this.clear();
    return;
  }

  // Recuse if we can
  if (this.nodes.length) {
    var index = this._getIndex(entity.spatial.absPosition(),
      entity.spatial.absHwidth());
    if (~index) return this.nodes[index].remove(entity);
  }
};

/**
 * Total recursive size of this tree.
 * @return {Number}
 */
QuadTree.prototype.totalSize = function()
{
  var size = this.entities.length;

  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    size += node.totalSize();
  }

  return size;
};

/**
 * Empty the tree recursively.
 */
QuadTree.prototype.clear = function()
{
  // Clear entity area
  for (var m = 0; m < this.entities.length; m++) {
    var entity = this.entities[m];
    entity.spatial._node = null;
  }
  this.entities.length = 0;

  // Recurse, free the node, and wipe out our node length
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    node.clear();
    this.pool.release(node);
  }
  this.nodes.length = 0;
};

/**
 * Get all tree entries that are interesected by a rectangle defined with
 * position and hwidth.
 * @param {Vec2} position
 * @param {Vec2} hwidth
 * @param {Array.<{spatial: Spatial}>=} out__objects Return objects.
 * @return {Array.<{spatial: Spatial}>} The out__objects parameter (filled up now)
 */
QuadTree.prototype.queryArea = function(position, hwidth, out__entities)
{
  var entities = out__entities || [];

  // If query belongs in ONLY a single node, then recurse
  var index = this._getIndex(position, hwidth);
  if (~index && this.nodes.length) {
    this.nodes[index].queryArea(position, hwidth, entities);

  // Otherwise, we have to add ALL of the nodes as it may be overlapping one
  } else {
    for (var j = 0; j < this.nodes.length; j++) {
      var node = this.nodes[j];
      node.queryArea(position, hwidth, entities);
    }
  }

  // Also add everything from this node itself
  for (var m = 0; m < this.entities.length; m++) {
    var entity = this.entities[m];

    var overlapping = Vec2.rectIntersect(
      entity.spatial.absPosition(),
      entity.spatial.absHwidth(),
      position,
      hwidth);

    if (overlapping) {
      entities.push(entity);
    }
  }

  return entities;
};

/**
 * Do a complete reset of the tree.
 */
QuadTree.prototype.reIndex = function()
{
  this._combine();
  this._splitAndRedistributeIfNeeded();
};

var tSize = new Vec2();
var tPos  = new Vec2();

/**
 * Check to see if an entity is still valid.
 * @param {{spatial: Spatial}} entity
 * @return {Boolean} True if the entity is in this tree (non-recursive) in its
 * correct place. False implies we need to re-add it.
 */
QuadTree.prototype.validateEntity = function(entity)
{
  var pos = entity.spatial.position;
  var hw  = entity.spatial.hwidth;

  // Check to see if we're still inside this node
  tSize.assign(this.size).smult(0.5);
  tPos.assign(tSize).add(this.position);
  var inside = Vec2.rectContains(pos, hw, tPos, tSize);

  if (!inside) return false;

  // No children nodes, then we're good
  if (!this.nodes.length)
    return true;

  // Or if children nodes and we overlap, still good
  var index = this._getIndex(entity.spatial.absPosition(),
    entity.spatial.absHwidth());
  if (this.nodes.length && !~index)
    return true;

  // Didnt make it
  return false;
};

/**
 * Return which of the 4 quandrants of this tree an object would go into.
 * @param {Vec2} position
 * @param {Vec2} hwidth
 * @return {Number} Which quandrant, or -1 if won't fit.
 * @private
 */
QuadTree.prototype._getIndex = function(position, hwidth)
{
  var midX = this.position.x + this.size.x / 2;
  var midY = this.position.y + this.size.y / 2;

  var left   = position.x - hwidth.x < midX && position.x + hwidth.x < midX;
  var right  = position.x - hwidth.x > midX && position.x + hwidth.x > midX;
  var top    = position.y - hwidth.y < midY && position.y + hwidth.y < midY;
  var bottom = position.y - hwidth.y > midY && position.y + hwidth.y > midY;

  if (top && right) return 0;
  if (top && left) return 1;
  if (bottom && left) return 2;
  if (bottom && right) return 3;

  return -1;
};

/**
 * If we've overpacked this tree, then split into 4 smaller trees (if we
 * haven't already) and redistribute.
 * @private
 */
QuadTree.prototype._splitAndRedistributeIfNeeded = function()
{
  if (this.entities.length > this.maxEntities &&
    this.level < this.maxLevels)
  {
    this._split();
    this._redistribute();
  }
};

/**
 * Create a sub quad tree
 * @return {QuadTree}
 * @private
 */
QuadTree.prototype._factory = function()
{
  var node = this.pool.aquire();

  node.pool        = this.pool;
  node.level       = this.level + 1;
  node.maxEntities = this.maxEntities;
  node.maxLevels   = this.maxLevels;

  return node;
};

/**
 * Create 4 sub nodes for the tree (does not populate tho)
 * @private
 */
QuadTree.prototype._split = function()
{
  if (this.nodes.length) return;

  var x = this.position.x;
  var y = this.position.y;

  var w = this.size.x / 2;
  var h = this.size.y / 2;

  // Create the seperate nodes
  for (var n = 0; n < 4; n++) {
    var node = this._factory();
    node.size.set(w, h);

    switch(n) {
      case 0:
        node.position.set(x + w, y);
        break;
      case 1:
        node.position.set(x, y);
        break;
      case 2:
        node.position.set(x, y + h);
        break;
      case 3:
        node.position.set(x + w, y + h);
        break;
    }

    this.nodes.push(node);
  }
};

/**
 * Distrubute all entities into child nodes if we can.
 * @private
 */
QuadTree.prototype._redistribute = function()
{
  // Loop through all of our entries and if they can fit into a child node,
  // move them there
  var i = 0;
  while (i < this.entities.length) {
    var entity = this.entities[i];
    var index = this._getIndex(entity.spatial.absPosition(),
      entity.spatial.absHwidth());

    // Insert into child, remove from our array if they belong in another node
    if (~index) {
      this.nodes[index].insert(entity);
      this.entities.splice(i, 1);
    } else {
      i++;
    }
  }
};

/**
 * Unwinds this node. Move all child nodes into this node and remove child
 * nodes.
 * @private
 */
QuadTree.prototype._combine = function()
{
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];

    // Combine all children first
    node._combine();

    // All entries combined on node, now add it to US
    for (var m = 0; m < node.entities.length; m++) {
      var entity = node.entities[m];
      this.entities.push(entity);
    }

    // Clear out and ensure we release it
    node.entities.length = 0;
    node.clear();
    this.pool.release(node);
  }

  // Clear nodes array
  this.nodes.length = 0;
};

