---
slug: javascript-es6-cheatsheet-spread-operator
title: ES6 cheatsheet  —  Spread Operator
description: "The spread syntax is simply three dots: `...` It allows an iterable to expand in places where 0+ arguments are expected."
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Spread Operator](//images.ctfassets.net/usz05rcag1x3/7uWUyLh8aNvTyjAQxWrunz/5d90cbab47d85573a094a9324fde8a32/1_rA3qD8SBiE_BrmeWuufvYw.png)

### Spread Operator

The spread syntax is simply three dots: `...` It allows an iterable to expand in places where 0+ arguments are expected.

### Calling Functions without Apply:

```
function doStuff (x, y, z) { }  
var args = [0, 1, 2];  

// Call the function, passing args  
doStuff.apply(null, args);

doStuff(...args);
```

Using spread operator:

```
const arr = [2, 4, 8, 6, 0];  
const max = Math.max(...arr);  

console.log(max); //8
```

Or another example using Math functions:

```
let mid = [3, 4];  
let arr = [1, 2, ...mid, 5, 6]; //[1, 2, 3, 4, 5, 6]
```

### Combine arrays

```
let arr = [1,2,3];  
let arr2 = [...arr]; // like arr.slice()  
arr2.push(4)
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
