---
slug: javascript-es6-cheatsheet-generators
title: ES6 cheatsheet  —  Generators
description: A generator is a function which can be exited and later re-entered. Their context (variable bindings) will be saved across re-entrances.
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 generators](//images.ctfassets.net/usz05rcag1x3/2OZYreQMdDi4r73f65x5GA/8502ec96971dca124e3dae6a61a7f4c3/1_rwj0mwY2iJ391EP3EVb0PA.png)

A `generator` is a function which can be exited and later re-entered. Their context (variable bindings) will be saved across re-entrances.

Generators in JavaScript are a very powerful tool for asynchronous programming as they mitigate the problems with callbacks, such as `Callback Hell` and `Inversion of Control`.

This pattern is what `async` functions are built on top of.

For creating a generator function, we use `function *` syntax instead of just `function`.

Calling a generator function does not execute its body immediately; an iterator object for the function is returned instead. When the iterator’s `next()` method is called, the generator function's body is executed until the first `yield` expression, which specifies the value to be returned from the iterator or, with `yield*`, delegates to another generator function.

The `next()` method returns an object with a value property containing the yielded value and a done property which indicates whether the generator has yielded its last value as a boolean. Calling the `next()` method with an argument will resume the generator function execution, replacing the yield expression where execution was paused with the argument from `next()`.

**Simple example:**

```
function* generator(i) {  
  yield i;  
  yield i + 10;  
}  

var gen = generator(10);  

console.log(gen.next().value);// expected output: 10  
console.log(gen.next().value); // expected output: 20
```

**Example with yield\*:**

```
function* anotherGenerator(i) {  
  yield i + 1;  
  yield i + 2;  
  yield i + 3;  
}  

function* generator(i) {  
  yield i;  
  yield* anotherGenerator(i);  
  yield i + 10;  
}  

var gen = generator(10);  

console.log(gen.next().value); // 10  
console.log(gen.next().value); // 11  
console.log(gen.next().value); // 12  
console.log(gen.next().value); // 13  
console.log(gen.next().value); // 20
```

**Infinite Data generator example:**

```
function * naturalNumbers() {  
  let num = 1;  
  while (true) {  
    yield num;  
    num = num + 1  
  }  
}  
const numbers = naturalNumbers();

console.log(numbers.next().value) // 1
console.log(numbers.next().value) // 2 
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
