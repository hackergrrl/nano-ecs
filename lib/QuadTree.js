module.exports = QuadTree;

var Pool = require('./Pool.js');
var Vec2 = require('./Vec2.js');

/**
 * Effectively store positional and sized objects. Constructor is setup to get
 * pooled. Each tree has a position and size, as well as up to 4 child nodes
 * (other trees) and an array of entries.
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
QuadTree.MAX_LEVELS = 6;

/**
 * A single item in the tree, contiains a pointer back to the node its in as
 * well as the spatial information of where its at. Setup to be pulled.
 * @constructor
 */
function Entry()
{
  this.obj = null;
  this.node = null;
  this.positon = new Vec2();
  this.size = new Vec2();
}

// Static Pools
var treePool = new Pool(QuadTree);
var entryPool = new Pool(Entry);

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
  this.size.clear();
};

/**
 * Pack an object into an entry and add it to the tree
 * @param {Object} object
 * @param {Vec2} position
 * @param {Vec2} size
 */
QuadTree.prototype.insert = function(object, position, size)
{
  var entry = entryPool.aquire();
  entry.position.assign(position);
  entry.size.assign(size);
  entry.obj = object;
  return this.insertEntry(entry);
};

/**
 * Add item to tree that is already packed into an entry.
 * @param {Entry} entry
 */
QuadTree.prototype.insertEntry = function(entry)
{

};

/**
 * If we've overpacked this tree, then split into 4 smaller trees and
 * redistribute.
 */
QuadTree.prototype.splitAndRedistributeIfNeeded = function()
{

};

/**
 * Removes an entry from the tree (but does NOT release it back to the pool!!)
 * @param {Entry} entry
 */
QuadTree.prototype.removeEntry = function(entry)
{

};

/**
 * Re-insert an entry in order to get it to the right place in the tree.
 */
QuadTree.prototype.reinsertEntry = function(entry)
{

};


/**
 * Returns true if the passed entry is still okay where its at. Returning false
 * means would she re-insert it into the tree in order to put it in its correct
 * place.
 * @param {Entry} param
 */
QuadTree.prototype.isEntryStillGood = function(entry)
{

};

/**
 * Distrubute all entrys into child nodes if we can.
 */
QuadTree.prototype.redistribute = function()
{

};

/**
 * @param {Vec2} position
 * @param {Vec2} size
 * @param {Array.<Entry>=} out__objects Return objects.
 */
QuadTree.prototype.getEntries = function(position, size, out__objects)
{

};

/**
 * @param {Vec2} position
 * @param {Vec2} size
 */
QuadTree.prototype.getIndex = function(position, size)
{

};

/**
 * Empty the tree recursively.
 */
QuadTree.prototype.clear = function()
{

};

/**
 * Unwinds this node. Move all child nodes into this node and remove child
 * nodes.
 */
QuadTree.prototype.combine = function()
{

};

/**
 * Create 4 sub nodes for the tree (does not populate tho)
 */
QuadTree.prototype.split = function()
{

};


