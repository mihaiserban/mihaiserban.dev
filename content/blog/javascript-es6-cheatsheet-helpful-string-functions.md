---
slug: javascript-es6-cheatsheet-helpful-string-functions
title: ES6 cheatsheet  —  Helpful string functions
description: Quick look at some helpful string functions introduced in ES6
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 string functions](//images.ctfassets.net/usz05rcag1x3/302gI8GePMtY5oKpjiQb1l/ac71dada789df7dc23be674baef118ac/1_1FqOzjfkPr33etNp8oqYew.png)

### .includes( )

```
var string = 'string';  
var substring = 'str';  

console.log(string.indexOf(substring) > -1);
```

Instead of checking for a return value `> -1` to denote string containment, we can simply use `.includes()` which will return a boolean:

```
const string = 'string';  
const substring = 'str';  

console.log(string.includes(substring)); // true
```

### .repeat( )

```
function repeat(string, count) {  
    var strings = [];  
    while(strings.length < count) {  
        strings.push(string);  
    }  
    return strings.join('');  
}
```

In ES6, we now have access to a nicer implementation:

```
// String.repeat(numberOfRepetitions)  
'str'.repeat(3); // 'strstrstr'
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
