module.exports = Messenger;

var Event = require('./Event.js');

/**
 * General event aggregation with filtering on components or tags.
 * @constructor
 */
function Messenger()
{
  this._events = {};
  this.fired   = 0;
  this.handled = 0;
}

/**
 * @param {String} eventName
 * @param {Function} callback
 * @return {Event}
 */
Messenger.prototype.listenTo = function(eventName, callback)
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
Messenger.prototype.trigger = function(eventName, entity, option)
{
  this.fired++;

  var events = this._events[eventName];
  if (!events) return;

  // Try all events
  for (var n = 0; n < events.length; n++) {
    var event = events[n];
    if (event.fire(eventName, entity, option))
      this.handled++;
  }
};

/**
 * Reset stats (should be done in the primary loop).
 */
Messenger.prototype.resetCounters = function()
{
  this.fired = this.handled = 0;
};
