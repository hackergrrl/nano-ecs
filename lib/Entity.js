module.exports = Entity;

/**
 * Basic component-driven object with facade functions for interacting with the
 * injected EntityManager object.
 * @constructor
 */
function Entity()
{
  /**
   * Unique identifier.
   */
  this.id = nextId++;

  /**
   * Ref to the manager for this facade, injected right after being
   * instantiated.
   * @private
   */
  this._manager    = null;

  /**
   * List of all the types of components on this entity.
   * @type {Array.<Function>}
   * @private
   */
  this._Components = [];

  /**
   * All tags that this entity currently has.
   * @type {Array.<String>}
   * @private
   */
  this._tags       = [];
}

/**
 * Re-init for pooling purposes.
 * @private
 */
Entity.prototype.__init = function()
{
  this.id                 = nextId++;
  this._manager           = null;
  this._Components.length = 0;
  this._tags.length       = 0;
};

var nextId = 0;

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
 * Drop all components.
 */
Entity.prototype.removeAllComponents = function()
{
  return this._manager.entityRemoveAllComponents(this);
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
 * Fire off an event on the messanger with this entity as the first parameter.
 * @param {String} eventName
 * @param {Object=} option
 */
Entity.prototype.trigger = function(eventName, option)
{
  this._manager.trigger(eventName, this, option);
};

/**
 * Remove the entity.
 * @return {void}
 */
Entity.prototype.remove = function()
{
  return this._manager.removeEntity(this);
};

