---
slug: javascript-es6-cheatsheet-map-weakmap
title: "ES6 cheatsheet  —  Map & WeakMap"
description: "Quick look into new Map & WeakMap introduced in ES6"
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Map snippet](//images.ctfassets.net/usz05rcag1x3/2zPO4jo3ePXBqn8fOr7Cdi/d015ad18408444fb53a7482c88f4591a/1_nK_beIXw-lIf1wTpd2kocg.png)

### Map

A `Map` is a data structure allows to associate data to a key.

Before it’s intruduction in ES6, people generally used objects as maps, by associating some object or value to a specific key value:

```
const person = {}  
person.name = 'John'  
person.age = 18  

console.log(person.name) //John  
console.log(person.age) //18
```

`Map` example:

```
const person = new Map()  

person.set('name', 'John')  
person.set('age', 18)  

const name = person.get('name')  
const age = person.get('age')  

console.log(name) //John  
console.log(age) //18
```

The `Map` also provide us with methods to help us manage the data.

`delete()` method - deletes an item from a map by key:

```
person.delete('name')
```

`clear()` method - delete all items from a map:

```
person.clear()
```

`has()` method - check if a map contains an item by key:

```
const hasName = person.has('name')
```

`size()` method - check the number of items in a map:

```
const size = person.size
```

We can also use a couple of methods to iterate:

`entries()` — get all entries

`keys()` — get only all keys

`values()` — get only all values

Find more details about `Map` [**here**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

### WeakMap

A `WeakMap` is a special kind of map.

In a `Map`, items are never garbage collected. A `WeakMap` instead lets all its items be freely garbage collected. Every key of a `WeakMap` is an object. When the reference to this object is lost, the value can be garbage collected.

Main differences between `WeakMap` and `Map`:

*   you cannot iterate over the keys or values (or key-values) of a WeakMap
*   you cannot clear all items from a WeakMap
*   you cannot check its size

A WeakMap exposes those methods, which are equivalent to the Map ones:

```
get(k)  
set(k, v)  
has(k)  
delete(k)
```

The use cases of a `WeakMap` are less evident than the ones of a `Map`, and you might never find the need for them, but essentially it can be used to build a memory-sensitive cache that is not going to interfere with garbage collection, or for careful encapsualtion and information hiding.

Find more details about `WeakMap` [**here**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
