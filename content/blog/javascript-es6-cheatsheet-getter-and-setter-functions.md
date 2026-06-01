---
slug: javascript-es6-cheatsheet-getter-and-setter-functions
title: ES6 cheatsheet  —  Getter and setter functions
description: "Let's take a look at getter and setter functions within ES6 classes. "
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 getter and setter functions](/images/blog/1_rt1b55HKcfIWZQf-olDhbQ.png)

ES6 has started supporting getter and setter functions within classes. Using the following example:

```
class Person {  
    constructor(name) {  
        this._name = name;  
    }  

    get name() {  
      if(this._name) {  
        return this._name.toUpperCase();    
      } else {  
        return undefined;  
      }    
    }  

    set name(newName) {  
      if (newName == this._name) {  
        console.log('I already have this name.');  
      } else if (newName) {  
        this._name = newName;  
      } else {  
        return false;  
      }  
    }  
}  

let person = new Person("John Doe");  

// uses the get method in the background  
if (person.name) {  
  console.log(person.name);  // John Doe  
}  

// uses the setter in the background  
person.name = "Jane Doe";  
console.log(person.name);  // Jane Doe
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://x.com/MihaiSerban), and share this with your friends 😀🙏🏻
