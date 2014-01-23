# TinyECS

[![Build Status](https://travis-ci.org/bvalosek/tiny-ecs.png?branch=master)](https://travis-ci.org/bvalosek/tiny-ecs)
[![NPM version](https://badge.fury.io/js/tiny-ecs.png)](http://badge.fury.io/js/tiny-ecs)

A mean lean Entity-Component-System library.

[![browser support](https://ci.testling.com/bvalosek/tiny-ecs.png)](https://ci.testling.com/bvalosek/tiny-ecs)

## Installation

Works on the server or the browser (via [Browserify](http://browserify.org)):

```
npm install tiny-ecs
```

## Usage

Manage entities via an `EntityManager` instance:

```javascript
var EntityManager = require('tiny-ecs').EntityManager;

var entities = new EntityManager();
```

## Creating Entities

Create an entity:

```javascript
var hero = entities.createEntity();
```

### Working with Entities

Components are added via providing any generic constructor function:

```javascript
function Position()
{
  this.x = 0;
  this.y = 0;
}
```

```javascript
function Sprite()
{
  this.image = 'hero.png';
}
```

Add the components:

```javascript
hero.addComponent(Position).addComponent(Sprite);
```

We now have new data members on our entity for the components. TinyECS will add
an instance member that is the name of the component constructor, lowercased.

```javascript
hero.position.x = 10;
hero.sprite.image === 'hero.png'; // true
```

Add arbitrary text tags to an entity:

```javascript
hero.addTag('player');
```

You can also remove components and tags in much the same way:

```javascript
hero.removeComponent(Sprite);
hero.removeTag('player');
```

To determine if an entity has a specific component:

```javascript
if (hero.hasComponent(Position)) { ... }
```

And to check if an entity has ALL of a set of components:

```javascript
if (hero.hasAllComponents([Position, Sprite])) { ... }
```

### Querying Entities

The entity manager is setup with indexed queries, allowing extremely fast
querying of the current entities. Querying entities returns an array of
entities.

Get all entities that have a specific set of components:

```javascript
var toDraw = entities.queryComponents([Position, Sprite]);
```

Get all entities with a certain tag:

```javascript
var enemies = entities.queryTag('enemy');
```

### Removing Entities

Directly:

```javascript
hero.remove();
```

Via the manager:

```javascript
entities.remove(hero);
```

### Creating Components

Any object constructor can be used as a component, nothing special required.
Components should be lean, primarily data containers, leaving all the heavy
lifting for the systems.

```javascript
function Position()
{
  this.x = 0;
  this.y = 0;
}
```

### Creating Systems

In TinyECS, there is no formal notion of a system. A system is considered any
context in which entities and their components are updated. As to how this
occurs will vary depending on your use.

In the example of a game, mainting a list of systems that are instantiated with
some sort of IoC container that request a list of entities seems like a good
idea.

```
function PhysicsSystem(entities)
{
  // Dependency inject -- reference to our EntityManager
  this.entities = entities;
}

PhysicsSystem.prototype.update = function(dt, time)
{
  var toUpdate = this.entities.queryComponents([Position, Physics]);

  toUpdate.forEach(function(entity) { ... });
  ...
}
```

## Tern Support

The source files are all decorated with [JSDoc3](http://usejsdoc.org/)-style
annotations that work great with the [Tern](http://ternjs.net/) code inference
system. Combined with the Node plugin (see this project's `.tern-project`
file), you can have intelligent autocomplete for methods in this library.

## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`.

Automated CI cross-browser testing is provided by
[Testling](http://ci.testling.com/bvalosek/tiny-ecs).


## License
Copyright 2014 Brandon Valosek

**TinyECS** is released under the MIT license.


