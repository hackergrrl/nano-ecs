module.exports = Event;

/**
 * @constructor
 */
function Event(name, callback)
{
  this._name     = name || 'name';
  this._callback = callback || null;

  // Additional filters
  this._Components = [];
}

/**
 * @param {String} eventName
 * @param {{hasAllComponents:Function}} entity
 * @param {Object=} option
 */
Event.prototype.check = function(eventName, entity, option)
{
  // Name check
  if (eventName !== this._name)
    return;

  // Component filters
  var Comps = this._Components;
  if (entity && entity.hasAllComponents && Comps.length) {
    if (!entity || !entity.hasAllComponents(Comps))
      return;
  }

  // Made it
  this._callback(entity, option);
};

/**
 * @param {Function} T
 * @return {Event} This object.
 */
Event.prototype.whereComponent = function(T)
{
  this._Components.push(T);
};

/**
 * @param {Array.<Function>} Components
 * @return {Event} This object.
 */
Event.prototype.whereComponents = function(Components)
{
  this._Components = this._Components.concat(Components);
  return this;
};

