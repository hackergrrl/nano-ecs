module.exports = Pool;

/**
 * @constructor
 * @param {Function} T
 */
function Pool(T, factory)
{
  this.freeList = [];
  this.count    = 0;
  this.T        = T;
}

/**
 * Get a pooled object
 */
Pool.prototype.aquire = function()
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
Pool.prototype.release = function(item)
{
  this.freeList.push(item);
};

/**
 * @param {Number} count
 */
Pool.prototype.expand = function(count)
{
  for (var n = 0; n < count; n++)
    this.freeList.push(new this.T());
  this.count += count;
};

/**
 * @return {Number}
 */
Pool.prototype.totalUsed = function()
{
  return this.count - this.freeList.length;
};

