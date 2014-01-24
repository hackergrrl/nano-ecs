module.exports = QuadTree;

var Pool = require('./Pool.js');
var Vec2 = require('./Vec2.js');

/**
 * Effectively store positional and sized objects. Each tree has a position and
 * size, as well as up to 4 child nodes (other trees) and an array of entries.
 * @constructor
 */
function QuadTree()
{
  this.level = 0;
  this.position = new Vec2();
  this.size = new Vec2();

  /**
   * @type {Array.<QuadTree>}
   */
  this.nodes = [];

  /**
   * @type {Array.<Entry>}
   */
  this.entries = [];
}

/**
 * Max number of entries in a node before it splits
 * @const
 */
QuadTree.MAX_ENTRIES = 15;

/**
 * Max depth the tree will split
 * @const
 */
QuadTree.MAX_LEVELS = 4;

/**
 * A single item in the tree, contiains a pointer back to the node its in as
 * well as the spatial information of where its at.
 * @constructor
 */
QuadTree.Entry = Entry;
function Entry()
{
  this.obj      = null;
  this.node     = null;
  this.position = new Vec2();
  this.hwidth   = new Vec2();
}

// Static Pools
QuadTree.pool = new Pool(QuadTree);
Entry.pool = new Pool(Entry);

QuadTree.prototype.__init = function()
{
  this.level = 0;
  this.position.clear();
  this.size.clear();
  this.nodes.length = 0;
  this.entries.length = 0;
};

Entry.prototype.__init = function()
{
  this.obj = null;
  this.node = null;
  this.position.clear();
  this.hwidth.clear();
};

/**
 * Pack an object into an entry and add it to the tree.
 * @param {Object} object
 * @param {Vec2} position
 * @param {Vec2} hwidth
 */
QuadTree.prototype.insert = function(object, position, hwidth)
{
  var entry = Entry.pool.aquire();
  entry.obj = object;
  entry.position.assign(position);
  entry.hwidth.assign(hwidth);
  return this.insertEntry(entry);
};

/**
 * Add item to tree that is already packed into an entry.
 * @param {Entry} entry
 */
QuadTree.prototype.insertEntry = function(entry)
{
  // Delegate insertion to a child node if we can
  if (this.nodes.length) {
    var index = this.getIndex(entry.position, entry.hwidth);
    if (~index) return this.nodes[index].insertEntry(entry);
  }

  this.entries.push(entry);
  entry.node = this;

  this.splitAndRedistributeIfNeeded();
  return entry;
};

/**
 * Return which of the 4 quandrants of this tree an object would go into.
 * @param {Vec2} position
 * @param {Vec2} hwidth
 * @return {Number} Which quandrant, or -1 if won't fit.
 */
QuadTree.prototype.getIndex = function(position, hwidth)
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
 */
QuadTree.prototype.splitAndRedistributeIfNeeded = function()
{
  if (this.entries.length > QuadTree.MAX_ENTRIES &&
    this.level < QuadTree.MAX_LEVELS)
  {
    this.split();
    this.redistribute();
  }
};

/**
 * Create 4 sub nodes for the tree (does not populate tho)
 */
QuadTree.prototype.split = function()
{
  if (this.nodes.length) return;

  var x = this.position.x;
  var y = this.position.y;

  var w = this.size.x / 2;
  var h = this.size.y / 2;

  // Create the seperate nodes
  for (var n = 0; n < 4; n++) {
    var node = QuadTree.pool.aquire();
    node.level = this.level + 1;
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
 * Distrubute all entrys into child nodes if we can.
 */
QuadTree.prototype.redistribute = function()
{
  // Loop through all of our entries and if they can fit into a child node,
  // move them there
  var i = 0;
  while (i < this.entries.length) {
    var entry = this.entries[i];
    var index = this.getIndex(entry.position, entry.hwidth);

    // Insert into child, remove from our array if they belong in another node
    if (~index) {
      this.nodes[index].insertEntry(entry);
      this.entries.splice(i, 1);
    } else {
      i++;
    }
  }
};

/**
 * Get all tree entries that are interesected by a rectangle defined with
 * position and hwidth.
 * @param {Vec2} position
 * @param {Vec2} hwidth
 * @param {Array.<Entry>=} out__objects Return objects.
 * @return {Array.<Entry>} The out__objects parameter (filled up now)
 */
QuadTree.prototype.getEntries = function(position, hwidth, out__objects)
{
  var objects = out__objects || [];

  // If query belongs in ONLY a single node, then recurse
  var index = this.getIndex(position, hwidth);
  if (~index && this.nodes.length) {
    this.nodes[index].getEntries(position, hwidth, objects);

  // Otherwise, we have to add ALL of the nodes as it may be overlapping one
  } else {
    for (var j = 0; j < this.nodes.length; j++) {
      var node = this.nodes[j];
      node.getEntries(position, hwidth, objects);
    }
  }

  // Also add everything from this node itself
  for (var m = 0; m < this.entries.length; m++) {
    var entry = this.entries[m];
    if (Vec2.rectIntersect(entry.position, entry.hwidth, position, hwidth))
      objects.push(entry);
  }

  return objects;
};

/**
 * Removes an entry from the tree (but does NOT release it back to the pool!!)
 * @param {Entry} entry
 */
QuadTree.prototype.popEntry = function(entry)
{
  var node = entry.node;
  var index = node.entries.indexOf(entry);
  node.entries.splice(index, 1);
  node.combine();
  node.splitAndRedistributeIfNeeded();

  return entry;
};

/**
 * Updates an entry and moves it in the tree if needed.
 * @param {Entry} entry
 * @param {Vec2} position
 * @param {Vec2} hwidth
 * @return {Boolean} True if we updated the entry.
 */
QuadTree.prototype.updateEntry = function(entry, position, hwidth)
{

  return false;
};

/**
 * Empty the tree recursively.
 */
QuadTree.prototype.clear = function()
{
  // Release all of our entries, clear the array
  for (var i = 0; i < this.entries.length; i++) {
    var entry = this.entries[i];
    Entry.pool.release(entry);
  }
  this.entries.length = 0;

  // Recurse, free the node, and wipe out our node length
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];
    node.clear();
    QuadTree.pool.release(node);
  }
  this.nodes.length = 0;
};

/**
 * Unwinds this node. Move all child nodes into this node and remove child
 * nodes.
 */
QuadTree.prototype.combine = function()
{
  for (var n = 0; n < this.nodes.length; n++) {
    var node = this.nodes[n];

    // Combine all children first
    node.combine();

    // All entries combined on node, now add it to US
    for (var m = 0; m < node.entries.length; m++) {
      var entry = node.entries[m];
      this.entries.push(entry);
      entry.node = this;
    }

    // Clear out and ensure we release it
    node.entries.length = 0;
    node.clear();
    QuadTree.pool.release(node);
  }

  // Clear nodes array
  this.nodes.length = 0;
};

