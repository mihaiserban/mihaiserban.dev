---
slug: javascript-es6-cheatsheet-helpful-array-functions
title: ES6 cheatsheet  —  Helpful array functions
description: Dive into new array functions introduced in ES6
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - JavaScript
  - ES6
---

![ES6 array functions](//images.ctfassets.net/usz05rcag1x3/2rzu20Dx3dpklhqD8sffdX/b1750dd4d59e92addfc04b06d93756b2/1__1bFnrLKJfM9oDP_twk8Pg.png)

`**from**`

```
const inventory = [  
    {name: 'mars', quantity: 2},  
    {name: 'snickers', quantity: 3}  
];  
console.log(Array.from(inventory, item => item.quantity + 2)); // [4, 5]
```

`**of**`

```
Array.of("Twinkle", "Little", "Star"); // returns ["Twinkle", "Little", "Star"]
```

`**find**`

```
const inventory = [  
    {name: 'mars', quantity: 2},  
    {name: 'snickers', quantity: 3}  
];  
console.log(inventory.find(item => item.name === 'mars')); // {name: 'mars', quantity: 2}
```

`**findIndex**`

```
const inventory = [  
    {name: 'mars', quantity: 2},  
    {name: 'snickers', quantity: 3}  
];  
console.log(inventory.findIndex(item => item.name === 'mars')); // 0
```

`**fill**` method takes up to three arguments value, start and end. The start and end arguments are optional with default values of 0 and the length of the this object.

```
[1, 2, 3].fill(1); // [1, 1, 1]  
[1, 2, 3].fill(4, 1, 2); // [1, 4, 3]
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
