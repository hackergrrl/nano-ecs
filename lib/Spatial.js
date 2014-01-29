module.exports = Spatial;

var Vec2 = require('./Vec2.js');

/**
 * Basic component giving an entity the concept of being located somewhere.
 * Creates basic spatial heirachy, positions, rotation, etc.
 * @constructor
 */
function Spatial()
{
  // Alloc our types
  this.position     = new Vec2();
  this.scale        = new Vec2();
  this.hwidth       = new Vec2();

  this._absScale    = new Vec2();
  this._absPosition = new Vec2();
  this._absHwidth   = new Vec2();

  // Setup
  this.__init();
}

/**
 * Setup called by pool.
 * @private
 */
Spatial.prototype.__init = function()
{
  this.rotation = 0;

  // Ref to quad tree node this component is in
  this._node = null;

  // Parent component
  this.parent = null;

  this.position.clear();
  this.scale.set(1, 1);
  this.hwidth.clear();
  this._absPosition.clear();
  this._absScale.set(1, 1);
  this._absHwidth.clear();
};

/**
 * Fired when spatials overlap.
 * @event
 */
Spatial.COINCIDENT = 'Spatial#COINCIDENT';

/**
 * Attach this component to another entity's Spatial.
 * @param {{spatial: Spatial}} entity An entity with a Spatial component
 */
Spatial.prototype.attachTo = function(entity)
{
  if (this.parent)
    throw new Error ('Entity already attached');

  if (!entity || !entity.spatial)
    throw new Error('Invalid / missing entity');

  this.parent = entity.spatial;
};

/**
 * The absolute world position of this component.
 * @return {Vec2}
 */
Spatial.prototype.absPosition = function()
{
  var v = this._absPosition.assign(this.position);

  // Trivial case, no parent
  if (!this.parent) {
    return v;
  }

  var parent = this.parent;

  // Rotate our angle by parent's angle
  var r = this.absRotation();
  v.rotate(parent.absRotation());

  // Scale by parents scale
  var pScale = parent.absScale();
  v.set(v.x * pScale.x, v.y * pScale.y);

  // Add parent's position
  return v.add(parent.absPosition());
};

/**
 * The absolute world rotation of this component.
 * @return {Number}
 */
Spatial.prototype.absRotation = function()
{
  // Trivial case
  if (!this.parent)
    return this.rotation;

  // This + parent
  var r = this.rotation + this.parent.absRotation();

  return r % (Math.PI*2);
};

/**
 * The absolute world hwidth for this component.
 * @return {Vec2}
 */
Spatial.prototype.absHwidth = function()
{
  var h = this._absHwidth.assign(this.hwidth);

  if (!this.parent)
    return h;

  var scale = this.absScale();

  return h.set(h.x * scale.x, h.y * scale.y);
};

/**
 * The absolute world scale of this component.
 * @return {Vec2}
 */
Spatial.prototype.absScale = function()
{
  var v = this._absScale.assign(this.scale);

  // Trivial case
  if (!this.parent) {
    return v;
  }

  var pScale = this.parent.absScale();

  return v.set(v.x * pScale.x, v.y * pScale.y);
};

