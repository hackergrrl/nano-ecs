module.exports = Vec2;

var ObjectPool = require('./ObjectPool.js');

/**
 * 2-dimension Cartesian vector with built-in (optional) object pool.
 * @constructor
 * @param {Number} x
 * @param {Number} y
 */
function Vec2(x, y)
{
  this.x = +x || 0.0;
  this.y = +y || 0.0;
}

/**
 * Reset for pool.
 * @private
 */
Vec2.prototype.__init = function()
{
  this.clear();
};

// Interal static object pool
var pool = new ObjectPool(Vec2);

/**
 * Get a vector from the pool.
 * @return {Vec2}
 */
Vec2.aquire = function()
{
  return pool.aquire();
};

/**
 * Return a vector to the pool.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.release = function(v)
{
  if (v) pool.release(v);
  return pool.count - pool.freeList.length;
};

/**
 * Reset this vector to (0,0).
 * @return {Vec2} This vector.
 */
Vec2.prototype.clear = function()
{
  this.x = this.y = 0.0;
  return this;
};

/**
 * Assign this vector the value of another.
 * @param {Vec2} v
 * @return {Vec2} This vector.
 */
Vec2.prototype.assign = function(v)
{
  this.x = v.x;
  this.y = v.y;
  return this;
};

/**
 * Determine if this vector is equal to another.
 * @param {Vec2} v
 * @return {Boolean} True if vectors are equal.
 */
Vec2.prototype.equals = function(v)
{
  return this.x === v.x && this.y === v.y;
};

/**
 * Set this vector to a set of coordinates.
 * @param {Number} x
 * @param {Number} y
 * @return {Vec2} This vector.
 */
Vec2.prototype.set = function(x, y)
{
  this.x = +x;
  this.y = +y;
  return this;
};

/**
 * Limit this vector to a specific magnitude.
 * @param {Number} size
 * @return {Vec2} This vector.
 */
Vec2.prototype.limit = function(size)
{
  size = +size;
  if (!size)
    return this;
  else if (this.magnitude() > size)
    return this.normalize(size);
  else
    return this;
};

/**
 * Normalize this vector.
 * @param {Number=} m Length.
 * @return {Vec2} This vector.
 */
Vec2.prototype.normalize = function(m)
{
  m = m || +1.0;
  var length = Math.sqrt(this.x * this.x + this.y * this.y);
  this.x = m * this.x / length;
  this.y = m * this.y / length;
  return this;
};

/**
t* Project this vector onto another.
 * @param {Vec2} v
 * @return {Vec2} This vector.
 */
Vec2.prototype.project = function(v)
{
  var m = v.dot(this) / v.magnitude2();
  this.assign(v).smult(m);
  return this;
};

/**
 * Make this vector perpandicular.
 * @return {Vec2} This vector.
 */
Vec2.prototype.perp = function()
{
  var x  = this.x;
  this.x = -this.y;
  this.y = x;
  return this;
};

/**
 * Left-hand perpandicular
 */
Vec2.prototype.lperp = function()
{
  var x  = this.x;
  this.x = this.y;
  this.y = -x;
  return this;
};

/**
 * Subtract some vector from this one.
 * @param {Vec2} v
 * @return {Vec2} This vector.
 */
Vec2.prototype.sub = function(v)
{
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

/**
 * Add some vector to this one.
 * @param {Vec2} v
 * @return {Vec2} This vector.
 */
Vec2.prototype.add = function(v)
{
  this.x += v.x;
  this.y += v.y;
  return this;
};

/**
 * Scalar multiply this vector by a value.
 * @param {Number} n
 * @return {Vec2} This vector.
 */
Vec2.prototype.smult = function(n)
{
  n = +n;
  this.x *= n;
  this.y *= n;
  return this;
};

/**
 * Rotate this vector clockwise about the origin by a certain angle.
 * @param {Number} theta
 * @return {Vec2} This vector.
 */
Vec2.prototype.rotate = function(theta)
{
  return this.set(
    this.x * Math.cos(theta) - this.y * Math.sin(theta),
    this.x * Math.sin(theta) + this.y * Math.cos(theta)
  );
};

/**
 * Get the dot product of this vector and another.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.prototype.dot = function(v)
{
  return +(this.x * v.x + this.y * v.y);
};

/**
 * Get the determinate of this vector and another.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.prototype.det = function(v)
{
  return +(this.x * v.y - this.y * v.x);
};

/**
 * Get the magnitude of this vector.
 * @return {Number}
 */
Vec2.prototype.magnitude = function()
{
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Get the squared magnitude of this vector.
 * @return {Number}
 */
Vec2.prototype.magnitude2 = function()
{
  return this.x * this.x + this.y * this.y;
};

var _vTemp = new Vec2();

/**
 * Distance between two vectors.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.prototype.distance = function(v)
{
  _vTemp.assign(this).sub(v);
  return _vTemp.magnitude();
};

/**
 * Distance squared between two vectors.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.prototype.distance2 = function(v)
{
  _vTemp.assign(this).sub(v);
  return _vTemp.magnitude2();
};

/**
 * Get the angle of this vector.
 * @return {Number}
 */
Vec2.prototype.angle = function()
{
  return Math.atan2(this.y, this.x);
};

/**
 * Get the angle between this vector and another.
 * @param {Vec2} v
 * @return {Number}
 */
Vec2.prototype.angleBetween = function(v)
{
  return Math.atan2(this.det(v), this.dot(v));
};

/**
 * Make a pooled copy of this vector
 * @return {Vec2} A new vector.
 */
Vec2.prototype.pcopy = function()
{
  return Vec2.aquire().assign(this);
};

/**
 * Make a copy of this vector.
 * @return {Vec2} A new vector.
 */
Vec2.prototype.copy = function()
{
  return new Vec2().assign(this);
};

/**
 * Create a vector with a specific angle and magnitude.
 * @param {Number} theta
 * @param {Number=} m
 * @return {Vec2} A new vector.
 */
Vec2.fromAngle = function(theta, m)
{
  m = +m || 1.0;
  return new Vec2(Math.cos(theta) * m, Math.sin(theta) * m);
};

/**
 * Create a pooled vector with a specific angle and magnitude.
 * @param {Number} theta
 * @param {Number} m
 * @return {Vec2} A new vector.
 */
Vec2.pfromAngle = function(theta, m)
{
  m = +m || 1.0;
  return Vec2.aquire().set(
    Math.cos(theta) * m,
    Math.sin(theta) * m
  );
};

/**
 * Determine if two rectangles, defined by a position and a halfwidth vector,
 * overlap.
 * @param {Vec2} p1 Position of rectangle 1
 * @param {Vec2} r1 Halfwidths of rectangle 1
 * @param {Vec2} p2 Position of rectangle 2
 * @param {Vec2} r2 Halfwidths of rectangle 2
 * @return {Boolean} True if they intersect
 */
Vec2.rectIntersect = function(p1, r1, p2, r2)
{
  // Basically, rectangles dont intersect if one's bottom is higher than ones
  // top, ones left is more left than ones right, etc
  var a = p1.x + r1.x < p2.x - r2.x;
  var b = p1.x - r1.x > p2.x + r2.x;
  var c = p1.y + r1.y < p2.y - r2.y;
  var d = p1.y - r1.y > p2.y + r2.y;

  // We want if they do
  return !(a || b || c || d);
};

/**
 * Determine if two circles, determined by a position and radius, overlap.
 * @param {Vec2} p1
 * @param {Number} r1
 * @param {Vec2} p2
 * @param {Number} r2
 */
Vec2.circleIntersect = function(p1, r1, p2, r2)
{
  var minDist2 = (r1 + r2) * (r1+ r2);
  return p1.distance2(p2) <= minDist2;
};

/**
 * Determines if rectangle 1 is entirely inside of rectangle 2.
 * @param {Vec2} p1 Position of rectangle 1
 * @param {Vec2} r1 Halfwidths of rectangle 1
 * @param {Vec2} p2 Position of rectangle 2
 * @param {Vec2} r2 Halfwidths of rectangle 2
 * @return {Boolean} True if they rectangle 1 is inside of rectangle 2
 */
Vec2.rectContains = function(p1, r1, p2, r2)
{
  if (p1.x - r1.x < p2.x - r2.x) return false;
  if (p1.x + r1.x > p2.x + r2.x) return false;
  if (p1.y - r1.y < p2.y - r2.y) return false;
  if (p1.y + r1.y > p2.y + r2.y) return false;

  return true;
};

/**
 * Convert a rectangle specified by top-left point + size into center location
 * + halfwidths.
 * @param {Vec2} position
 * @param {Vec2} size
 * @param {Vec2} outPosition Output position
 * @param {Vec2} outHwidth Output hwidths
 */
Vec2.sizeToHwidth = function(position, size, outPosition, outHwidth)
{
  outHwidth.assign(size).smult(0.5);
  outPosition.assign(position).add(outHwidth);
};

/**
 * Output this vector.
 */
Vec2.prototype.toString = function()
{
  return '' + (this.x.toFixed(2)) + ',' + (this.y.toFixed(2));
};

