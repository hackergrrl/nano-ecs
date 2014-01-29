module.exports = ObjectPool;

/**
 * Minimize garbage collector thrashing by re-using existing objects instead of
 * creating new ones. Requires manually lifecycle management.
 * @constructor
 * @param {Function} T
 */
function ObjectPool(T)
{
  this.freeList = [];
  this.count    = 0;
  this.T        = T;
}

/**
 * Get a pooled object
 */
ObjectPool.prototype.aquire = function()
{
  // Grow the list by 20%ish if we're out
  if (this.freeList.length <= 0) {
    this.expand(Math.round(this.count*0.2) + 1);
  }

  var item = this.freeList.pop();

  // We can provide explicit initing, otherwise re-call constructor (hackish)
  if (item.__init)
    item.__init();
  else
    this.T.call(item);

  return item;
};

/**
 * Return an object back to the pool.
 */
ObjectPool.prototype.release = function(item)
{
  this.freeList.push(item);
};

/**
 * @param {Number} Amount of new objects to allocate for this pool.
 */
ObjectPool.prototype.expand = function(count)
{
  for (var n = 0; n < count; n++)
    this.freeList.push(new this.T());
  this.count += count;
};

/**
 * @return {Number} Total amount of allocated objects (available and in-use).
 */
ObjectPool.prototype.totalSize = function()
{
  return this.count;
};

/**
 * @return {Number} Total number of objects currently available.
 */
ObjectPool.prototype.totalFree = function()
{
  return this.freeList.length;
};

/**
 * @return {Number} Total number of objects currently in-use.
 */
ObjectPool.prototype.totalUsed = function()
{
  return this.count - this.freeList.length;
};

