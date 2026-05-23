---
slug: javascript-es6-cheatsheet-promises
title: ES6 cheatsheet  —  Promises
description: Promises are one of the most exciting additions to JavaScript ES6. Promises are a pattern that greatly simplifies asynchronous programming by making the code look synchronous and avoid problems associated with callbacks.
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Promises](/images/blog/1_AqkCUN-kD_fLefEFPnX2Uw.png)

Promises are one of the most exciting additions to JavaScript ES6. Promises are a pattern that greatly simplifies asynchronous programming by making the code look synchronous and avoid problems associated with callbacks.

Prior to ES6, we used [bluebird](https://github.com/petkaantonov/bluebird) or [Q](https://github.com/kriskowal/q). Now we have Promises natively.

`A Promise is an object that is used as a placeholder for the eventual results of a deferred (and possibly asynchronous) computation.`

The `resolve` and `reject` are functions themselves and are used to send back values to the promise object.

```
const myPromise = new Promise((resolve, reject) => {  
    if (Math.random() * 100 <= 90) {  
        resolve('Hello, Promises!');  
    }  
    reject(new Error('In 10% of the cases, I fail. Miserably.'));  
});  

myPromise.then((resolvedValue) => {  
    console.log(resolvedValue); //Hello, Promises!  
}, (error) => {  
    console.log(error); //In 10% of the cases, I fail. Miserably.  
});
```

**Chaining Promises:**

Promises allow us to turn our horizontal code (callback hell):

```
func1(function (value1) {  
    func2(value1, function (value2) {  
        func3(value2, function (value3) {  
          // Do something with value 3  
        });  
    });  
});
```

Into vertical code like so:

```
func1(value1)  
    .then(func2)  
    .then(func3, value3 => {  
        // Do something with value 3  
    });
```

**Parallelize Promises:**

We can use `Promise.all()` to handle an array of asynchronous operations.

```
let urls = [  
  '/api/commits',  
  '/api/issues/opened',  
  '/api/issues/assigned',  
  '/api/issues/completed',  
  '/api/issues/comments',  
  '/api/pullrequests'  
];  

let promises = urls.map((url) => {  
  return new Promise((resolve, reject) => {  
    $.ajax({ url: url })  
      .done((data) => {  
        resolve(data);  
      });  
  });  
});  

Promise.all(promises)  
  .then((results) => {  
    // Do something with results of all our promises  
 });
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
