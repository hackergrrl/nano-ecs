module.exports = Messanger;

var Event = require('./Event.js');

/**
 * General event aggregation with filtering on components or tags.
 * @constructor
 */
function Messanger()
{
  this._events = {};
}

/**
 * @param {String} eventName
 * @param {Function} callback
 * @return {Event}
 */
Messanger.prototype.listenTo = function(eventName, callback)
{
  if (!this._events[eventName])
    this._events[eventName] = [];

  var event = new Event(eventName, callback);

  // Dump and chump
  this._events[eventName].push(event);
  return event;
};

/**
 * @param {String} eventName
 * @param {Object=} entity
 * @param {Option=} option
 */
Messanger.prototype.trigger = function(eventName, entity, option)
{
  var events = this._events[eventName];
  if (!events) return;

  // Try all events
  for (var n = 0; n < events.length; n++) {
    var event = events[n];
    event.check(eventName, entity, option);
  }
};

