---
slug: javascript-es6-cheatsheet-async-await
title: ES6 cheatsheet  —  Async Await
description: Async/Await is a new way to write asynchronous code. Previous options for asynchronous code are callbacks and promises.
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Async/Await](//images.ctfassets.net/usz05rcag1x3/3VssyYPOq5KiFbQVO9Mtv4/c3131ab32204a677bc04b3227b1f8cd4/1_U5MZoXlTOdyxlwf7XBqcHw.png)

*   Async/await is a new way to write asynchronous code. Previous options for asynchronous code are callbacks and promises.
*   Async/await is built on top of promises. It cannot be used with plain callbacks or node callbacks.
*   Async/await makes asynchronous code look and behave a little more like synchronous code.

Note that `await` may only be used in functions marked with the `async` keyword. It works similarly to generators, suspending execution in your context until the promise settles. If the awaited expression isn’t a promise, its casted into a promise.

`async await` allows us to perform the same thing we accomplished using Generators and Promises with less effort:

```
var request = require('request');  

function getJSON(url) {  
  return new Promise(function(resolve, reject) {  
    request(url, function(error, response, body) {  
      resolve(body);  
    });  
  });  
}  

async function main() {  
  var data = await getJSON();  
  console.log(data);  
}  

main();
```

Under the hood, it performs similarly to [Generators](https://medium.com/@serbanmihai/javascript-es6-cheatsheet-generators-997cc977f7f1).

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
