module.exports = Entity;

/**
 * Basic component-driven object with facade function for interacting with the
 * injected Entities manager object.
 * @param {Entities} manager
 * @constructor
 */
function Entity()
{
  this._manager    = null;
  this._Components = [];
  this._tags       = [];
}

/**
 * Add a component to this entity
 * @param {Function} TComponent
 * @return {Entity} This entity.
 */
Entity.prototype.addComponent = function(TComponent)
{
  this._manager.entityAddComponent(this, TComponent);
  return this;
};

/**
 * Remove a Component from this entity.
 * @param {Function} TComponent
 * @return {Entity} This entity.
 */
Entity.prototype.removeComponent = function(TComponent)
{
  this._manager.entityRemoveComponent(this, TComponent);
  return this;
};

/**
 * Determine if this entity has some Component.
 * @param {Function} TComponent
 * @return {boolean}
 */
Entity.prototype.hasComponent = function(TComponent)
{
  return !!~this._Components.indexOf(Component);
};

/**
 * Determine if this entity has all of a set of Components.
 * @param {Array.<Function>} Components
 * @return {boolean}
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
 * @return {boolean}
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

