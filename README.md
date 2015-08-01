# nano-ecs

> A nano-sized entity-component-system module.

`nano-ecs` is not a big bloated game engine framework, but rather a small
focused module that [does one thing well](unix link): creating and managing a
set of entities and their components.

> TODO: background links on theory of ECS (maybe an article of mine?)


## Installation

Works on the server or the browser (via [Browserify](http://browserify.org)):

```
npm install nano-ecs
```


## Usage

Manage your entities via a `nano` entity manager instance:

```javascript
var nano = require('nano-ecs')

var world = nano()
```


### Creating Entities

Create an entity, bereft of components:

```javascript
var hero = world.createEntity();
```


### Adding Components

A component is just a function that defines whatever properties on `this` that
it'd like:

```javascript
function PlayerControlled()
{
  this.gamepad = 1;
}
```

```javascript
function Sprite()
{
  this.image = 'hero.png';
}
```

Components are added using `addComponent` and support chaining:

```javascript
hero.addComponent(PlayerControlled).addComponent(Sprite);
```

Preferring convention over configuration, `nano-ecs` will add an instance member
that is the name of the component constructor, camelCased:

```javascript
hero.playerControlled.gamepad = 2;
hero.sprite.image === 'hero.png'; // true
```

Entities can be tagged with a string for fast retrieval:

```javascript
hero.addTag('player');

...

var hero = world.queryTag('player')[0]
```

You can also remove components and tags in much the same way:

```javascript
hero.removeComponent(Sprite);
hero.removeTag('player');
```

`hasComponent` will efficiently determine if an entity has a specific single
component:

```javascript
if (hero.hasComponent(Transform)) { ... }
```

A set of components can also be quickly checked:

```javascript
if (hero.hasAllComponents([Transform, Sprite])) { ... }
```


### Querying Entities

The entity manager indexes entities and their components, allowing extremely
fast queries.

Entity queries return an array of entities.

Get all entities that have a specific set of components:

```javascript
var toDraw = entities.queryComponents([Transform, Sprite]);
```

Get all entities with a certain tag:

```javascript
var enemies = entities.queryTag('enemy');
```


### Removing Entities

```javascript
hero.remove();
```


### Components

Any object constructor can be used as a component--nothing special required.
Components should be lean data containers, leaving all the heavy lifting for the
systems.


### Creating Systems

In `nano-ecs`, there is no formal notion of a system. A system is considered any
context in which entities and their components are updated. As to how this
occurs will vary depending on your use.

In the example of a game, you could maintain a list of systems that are
instantiated with a reference to the entity's world:

```
function PhysicsSystem (world)
{
  this.update = function (dt, time) {
    var candidates = world.queryComponents([Transform, RigidBody]);

    candidates.forEach(function(entity) {
      ...
    });
  }
}
```


## Events

All entities can act as event emitters. One part of the game code can raise an
event on an entity that a specific component or other system is free to handle:

```javascript
function Health (entity) {
  this.hp = 100

  entity.on('damage', function (amount) {
    this.hp -= amount
    if (this.hp < 0) {
      entity.emit('death')
    }
  })
}
```


## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`. There is also a pre-commit hook that will ensure
tests pass before any commit is permitted.


## License
Copyright 2014 Brandon Valosek, forked and modified by Stephen Whitmore.

**nano-ecs** is released under the MIT license.


