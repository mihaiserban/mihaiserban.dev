---
slug: javascript-es6-cheatsheet-variable-declarations
title: ES6 cheatsheet — Variable Declarations
description: "An introduction to ES6 variable declarations, differences between var, let, const."
date: "2018-10-17T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![es6-variables](/images/blog/1_T6qcNaaF8T0HedbwF2ZmyQ.png)

ES6 brought `let` and `const` with proper lexical scoping. `let` is the new `var`. Constants work just like `let`, but can’t be reassigned. `let` and `const` are block scoped. Therefore, referencing block-scoped identifiers before they are defined will produce a `ReferenceError`.

Example using `var`:

```
var variable = 5;

{
  console.log('inside', variable); //5
  var variable = 10;
}

console.log('outside', variable); //10
```

Example using `const`:

```
const variable = 5;

variable = variable*2; // TypeError: Attempted to assign to readonly property.
```

Constants are tricky with array and objects. The `reference` becomes constant but the value does not.

```
const variable = [5];

console.log(variable) // [5]

variable = [2]; //TypeError: Attempted to assign to readonly property.

variable[0] = 1;
console.log(variable) // [1]
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
