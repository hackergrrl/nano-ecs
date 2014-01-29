module.exports = Entity;

/**
 * Basic component-driven object with facade functions for interacting with the
 * injected EntityManager object.
 * @constructor
 */
function Entity()
{
  // Injected by EntityManager
  this._manager    = null;

  /**
   * @type {Array.<Function>}
   * @private
   */
  this._Components = [];

  /**
   * @type {Array.<String>}
   * @private
   */
  this._tags       = [];
}

/**
 * @param {Function} TComponent
 * @return {Entity} This entity.
 */
Entity.prototype.addComponent = function(TComponent)
{
  this._manager.entityAddComponent(this, TComponent);
  return this;
};

/**
 * @param {Function} TComponent
 * @return {Entity} This entity.
 */
Entity.prototype.removeComponent = function(TComponent)
{
  this._manager.entityRemoveComponent(this, TComponent);
  return this;
};

/**
 * @param {Function} TComponent
 * @return {boolean} True if this entity has TComponent.
 */
Entity.prototype.hasComponent = function(TComponent)
{
  return !!~this._Components.indexOf(TComponent);
};

/**
 * @param {Array.<Function>} Components
 * @return {boolean} True if entity has all Components.
 */
Entity.prototype.hasAllComponents = function(Components)
{
  var b = true;

  for (var i = 0; i < Components.length; i++) {
    var C = Components[i];
    b &= !!~this._Components.indexOf(C);
  }

  return b;
};

/**
 * @param {String} tag
 * @return {boolean} True if entity has tag.
 */
Entity.prototype.hasTag = function(tag)
{
  return !!~this._tags.indexOf(tag);
};

/**
 * @param {String} tag
 * @return {Entity} This entity.
 */
Entity.prototype.addTag = function(tag)
{
  this._manager.entityAddTag(this, tag);
  return this;
};

/**
 * @param {String} tag
 * @return {Entity} This entity.
 */
Entity.prototype.removeTag = function(tag)
{
  this._manager.entityRemoveTag(this, tag);
  return this;
};

/**
 * @return {void}
 */
Entity.prototype.remove = function()
{
  return this._manager.removeEntity(this);
};

