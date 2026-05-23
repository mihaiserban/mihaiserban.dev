---
slug: javascript-es6-cheatsheet-set-weakset
title: "ES6 cheatsheet  —  Set & WeakSet"
description: A Set is a collection for unique values. The values can be primitives or object references.
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Set](/images/blog/1_AJDn2sPnvaDVOHZo2F3Zaw.png)

A `Set` is a collection for unique values. The values can be primitives or object references.

```
let set = new Set();  
set.add(1);  
set.add('1');  
set.add({ key: 'value' });  
console.log(set); // Set {1, '1', Object {key: 'value'}}
```

Most importantly is that it does not allow duplicate values, one good use if to remove duplicate values from an array:

```
[ ...new Set([1, 2, 3, 1, 2, 3]) ] //[1, 2, 3]
```

Iteration using built-in method forEach and for..of:

```
// forEach  
let set = new Set([1, '1', { key: 'value' }]);  
set.forEach(function (value) {  
  console.log(value);  
  // 1  
  // '1'  
  // Object {key: 'value'}  
});

// for..of  
let set = new Set([1, '1', { key: 'value' }]);  
for (let value of set) {  
  console.log(value);  
  // 1  
  // '1'  
  // Object {key: 'value'}  
};
```

Similar to `Map`, `Set` provides us with methods such as `has()`, `delete()`, `clear()`.

Find more details about `Set` [**here**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

### WeakSet

Like a `WeakMap`, `WeakSet` is a `Set` that doesn’t prevent its values from being garbage-collected. It has simpler API than `WeakMap`, because has only three methods:

```
new WeakSet([iterable])  
WeakSet.prototype.add(value)    : any  
WeakSet.prototype.has(value)    : boolean  
WeakSet.prototype.delete(value) : boolean
```

Important thing to note `WeakSet` is a collection that can‘t be iterated and whose size cannot be determined.

Find more details about `WeakSet` [**here**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
