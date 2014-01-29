module.exports = EntityManager;

var Entity     = require('./Entity.js');
var ObjectPool = require('./ObjectPool.js');
var Messanger  = require('./Messanger.js');
var getName    = require('typedef').getName;

/**
 * Manage, create, and destroy entities. Can use methods to mutate entities
 * (tags, components) directly or via the facade on the Entity.
 * @param {Messanger} messanger
 * @constructor
 */
function EntityManager(messanger)
{
  this.messanger = messanger;
  this._tags = {};

  /**
   * @type {Array.<Entity>}
   */
  this._entities = [];

  /**
   * @type {Array.<Group>}
   */
  this._groups = {};

  this._entityPool = new ObjectPool(Entity);

  this._componentPools = {};
}

/**
 * Fired AFTER an entity has be created.
 * @event
 */
EntityManager.ENTITY_CREATED = 'EntityManager#ENTITY_CREATED';

/**
 * Fired BEFORE an entity has been removed.
 * @event
 */
EntityManager.ENTITY_REMOVE = 'EntityManager#ENTITY_REMOVE';

/**
 * Fired AFTER a component has been removed.
 * @event
 */
EntityManager.COMPONENT_ADDED = 'EntityManager#COMPONENT_ADDED';

/**
 * Fired BEFORE a component has been removedt
 * @event
 */
EntityManager.COMPONENT_REMOVE = 'EntityManager#COMPONENT_REMOVE';

/**
 * @constructor
 * @param {Array.<Function>} Components
 * @param {Array<Entity>} entities
 */
function Group(Components, entities)
{
  this.Components = Components || [];
  this.entities = entities || [];
}

/**
 * Get a new entity.
 * @return {Entity}
 */
EntityManager.prototype.createEntity = function()
{
  var entity = this._entityPool.aquire();

  this._entities.push(entity);
  entity._manager = this;
  this._trigger(EntityManager.ENTITY_CREATED, entity);
  return entity;
};

/**
 * Cleanly remove entities based on tag. Avoids loop issues.
 * @param {String} tag
 */
EntityManager.prototype.removeEntitiesByTag = function(tag)
{
  var entities = this._tags[tag];

  if (!entities) return;

  for (var x = entities.length - 1; x >= 0; x--) {
    var entity = entities[x];
    entity.remove();
  }
};

/**
 * Dump all entities out of the manager. Avoids loop issues.
 */
EntityManager.prototype.removeAllEntities = function()
{
  for (var x = this._entities.length - 1; x >= 0; x--) {
    this._entities[x].remove();
  }
};

/**
 * Drop an entity. Returns it to the pool and fires all events for removing
 * components as well.
 * @param {Entity} entity
 */
EntityManager.prototype.removeEntity = function(entity)
{
  var index = this._entities.indexOf(entity);

  if (!~index)
    throw new Error('Tried to remove entity not in list');

  this.entityRemoveAllComponents(entity);

  // Remove from entity list
  this._trigger(EntityManager.ENTITY_REMOVE, entity);
  this._entities.splice(index, 1);

  // Remove entity from any tag groups
  entity._tags = null;
  for (var tag in this._tags) {
    var entities = this._tags[tag];
    var n = entities.indexOf(entity);
    if (~n) entities.splice(n, 1);
  }

  // Prevent any acecss and free
  entity._manager = null;
  this._entityPool.release(entity);
};

/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.entityAddTag = function(entity, tag)
{
  var entities = this._tags[tag];

  if (!entities)
    entities = this._tags[tag] = [];

  // Don't add if already there
  if (~entities.indexOf(entity)) return;

  entities.push(entity);
  entity._tags.push(tag);
};

/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.entityRemoveTag = function(entity, tag)
{
  var entities = this._tags[tag];
  if (!entities) return;

  var index = entities.indexOf(entity);
  if (!~index) return;

  entities.splice(index, 1);
  entity._tags.splice(entity._tags.indexOf(tag), 1);
};

/**
 * @param {Entity} entity
 * @param {Function} Component
 */
EntityManager.prototype.entityAddComponent = function(entity, Component)
{
  if (~entity._Components.indexOf(Component)) return;

  entity._Components.push(Component);

  // Create the reference on the entity to this (aquired) component
  var cName = componentPropertyName(Component);
  var cPool = this._componentPools[cName];
  if (!cPool)
    cPool = this._componentPools[cName] = new ObjectPool(Component);
  var component = cPool.aquire();
  entity[cName] = component;

  // Check each indexed group to see if we need to add this entity to the list
  for (var groupName in this._groups) {
    var group = this._groups[groupName];

    if (!~group.Components.indexOf(Component))
      continue;
    if (!entity.hasAllComponents(group.Components))
      continue;
    if (~group.entities.indexOf(entity))
      continue;

    group.entities.push(entity);
  }

  this._trigger(EntityManager.COMPONENT_ADDED, entity, Component);
};

/**
 * Drop all components on an entity.
 * @param {Entity} entity
 */
EntityManager.prototype.entityRemoveAllComponents = function(entity)
{
  var Cs = entity._Components;

  for (var j = Cs.length - 1; j >= 0; j--) {
    var C = Cs[j];
    entity.removeComponent(C);
  }
};

/**
 * @param {Entity} entity
 * @param {Function} Component
 */
EntityManager.prototype.entityRemoveComponent = function(entity, Component)
{
  var index = entity._Components.indexOf(Component);
  if (!~index) return;

  this._trigger(EntityManager.COMPONENT_REMOVE, entity, Component);

  // Check each indexed group to see if we need to remove it
  for (var groupName in this._groups) {
    var group = this._groups[groupName];

    if (!~group.Components.indexOf(Component))
      continue;
    if (!entity.hasAllComponents(group.Components))
      continue;

    var loc = group.entities.indexOf(entity);
    if (~loc) {
      group.entities.splice(loc, 1);
    }
  }

  // Remove T listing on entity and property ref, then free the component.
  var propName = componentPropertyName(Component);
  entity._Components.splice(index, 1);
  var component = entity[propName];
  delete entity[propName];
  this._componentPools[propName].release(component);
};

/**
 * @param {Array.<Function>} Components
 * @return {Array.<Entity>}
 */
EntityManager.prototype.queryComponents = function(Components)
{
  var group = this._groups[groupKey(Components)];

  if (!group) {
    group = this._indexGroup(Components);
  }

  return group.entities;
};

/**
 * @param {String} tag
 * @return {Array.<Entity>}
 */
EntityManager.prototype.queryTag = function(tag)
{
  var entities = this._tags[tag];

  if (entities === undefined)
    entities = this._tags[tag] = [];

  return entities;
};

/**
 * @return {Number} Total number of entities.
 */
EntityManager.prototype.count = function()
{
  return this._entities.length;
};

/**
 * Get information about the object pools of the entities and the various
 * components.
 * @return {Object}
 */
EntityManager.prototype.poolStats = function()
{
  var stats = {};
  var e = this._entityPool;
  stats.entity = {
    used: this._entityPool.totalUsed(),
    size: this._entityPool.count
  };

  for (var cName in this._componentPools) {
    var pool = this._componentPools[cName];
    stats[cName] = {
      used: pool.totalUsed(),
      size: pool.count
    };
  }

  return stats;
};

/**
 * Create an index of entities with a set of components.
 * @param {Array.<Function>} Components
 * @private
 */
EntityManager.prototype._indexGroup = function(Components)
{
  var key = groupKey(Components);

  if (this._groups[key]) return;

  var group = this._groups[key] = new Group(Components);

  for (var n = 0; n < this._entities.length; n++) {
    var entity = this._entities[n];
    if (entity.hasAllComponents(Components)) {
      group.entities.push(entity);
    }
  }

  return group;
};

/**
 * Trigger the messanger if we have one.
 * @param {String} event
 * @param {Object=} a
 * @param {Object=} b
 */
EntityManager.prototype._trigger = function(event, a, b)
{
  if (this.messanger)
    this.messanger.trigger(event, a, b);
};

/**
 * @param {Function} Component
 * @return {String}
 * @private
 */
function componentPropertyName(Component)
{
  var name = getName(Component);
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/**
 * @param {Array.<Function>} Components
 * @return {String}
 * @private
 */
function groupKey(Components)
{
  var names = [];
  for (var n = 0; n < Components.length; n++) {
    var T = Components[n];
    names.push(getName(T));
  }

  return names
    .map(function(x) { return x.toLowerCase(); })
    .sort()
    .join('-');
}

