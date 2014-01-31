# Change History

## 2.0.0 (2014-01-30)

* Added `Messanger` to serve as event hub for entities and other systems.
* Created `Event` class for fluent filtering when setting up listeners.
* Entity manager now takes an injected messanger that will be used to signal
  events.
* Entity manager now fires events on entity add/remove and component
  add/remove.
* Renamed `Pool` to `ObjectPool`
* Added `removeAllEntities()`, `entityRemoveAllComponents()`, and `poolStats()`
  functions to the entity manager.
* Added the `Spatial` class, the only component included in TinyECS. This
  encompasses relative position, scale, rotation, and handles to the quad tree
  that is indexing its location.
* Misc. bug fixes and speedups to the `QuadTree`

## 1.4.1 (2014-01-26)

* Fixed a bug of having references to components on entities not getting
* properly deleted.

## 1.4.0 (2014-01-25)

* Added `removeEntitiesByTag()` method
* Removing entities in a loop still bad!!

## 1.3.0 (2014-01-24)

* `Vec2` and `QuadTree` classes added.
* Improvements to `Pool` class.

## 1.2.0 (2014-01-22)

* Added `EntityManager#poolStats()`.

## 1.1.0 (2014-01-22)

* Adding in object pooling for entities and components.
* Removed factory / recycler action.

#t 1.0.1 (2014-01-21)

* Type-hinting JSDoc and README updates.

## 1.0.0 (2014-01-21)

* First release.
