---
slug: javascript-es6-cheatsheet-classes
title: ES6 cheatsheet  —  Classes
description: "Prior to ES6, we implemented Classes by creating a constructor function and  adding properties by extending the prototype"
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 Classes](/images/blog/1_zdv7_BKFCrpmGwfPgu6j3A.png)

Prior to ES6, we implemented Classes by creating a constructor function and adding properties by extending the prototype:

```
function Person(name, age, gender) {  
    this.name   = name;  
    this.age    = age;  
    this.gender = gender;  
}  

Person.prototype.incrementAge = function () {  
    return this.age += 1;  
};
```

And created extended classes by the following:

```
function Personal(name, age, gender, occupation, hobby) {  
    Person.call(this, name, age, gender);  
    this.occupation = occupation;  
    this.hobby = hobby;  
}  

Personal.prototype = Object.create(Person.prototype);  
Personal.prototype.constructor = Personal;  
Personal.prototype.incrementAge = function () {  
    Person.prototype.incrementAge.call(this);  
    this.age += 20;  
    console.log(this.age);  
};
```

ES6 classes are a simple sugar over the prototype-based OO pattern. Classes support prototype-based inheritance, super calls, instance and static methods and constructors:

```
class Person {  
    constructor(name, age, gender) {  
        this.name   = name;  
        this.age    = age;  
        this.gender = gender;  
    }  

    incrementAge() {  
      this.age += 1;  
    }  
}
```

And extend them using the `extends` keyword:

```
class Personal extends Person {  
    constructor(name, age, gender, occupation, hobby) {  
        super(name, age, gender);  
        this.occupation = occupation;  
        this.hobby = hobby;  
    }  

    incrementAge() {  
        super.incrementAge();  
        this.age += 20;  
        console.log(this.age);  
    }  
}
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
