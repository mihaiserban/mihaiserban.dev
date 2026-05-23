---
slug: javascript-es6-cheatsheet-modules
title: ES6 cheatsheet  —  Modules
description: "Prior to ES6, we used libraries such as Browserify to create modules on the client-side, and require in Node.js. With ES6, we can now directly use modules of all types (AMD and CommonJS)."
date: "2018-10-21T00:00+02:00"
hidden: false
tags:
  - ES6
  - JavaScript
---

![ES6 modules](//images.ctfassets.net/usz05rcag1x3/2bfb5hD4e0U4T9au7nZshf/311e66bdda6dd7cd213dfc430500c57f/1_AVuC2PTg3VOE6EEZTfnydw.png)

Prior to ES6, we used libraries such as [Browserify](http://browserify.org/) to create modules on the client-side, and [require](https://nodejs.org/api/modules.html#modules_module_require_id) in **Node.js**. With ES6, we can now directly use modules of all types (AMD and CommonJS).

### Exporting in CommonJS

```
module.exports = 1;  
module.exports = { foo: 'bar' };  
module.exports = ['foo', 'bar'];  
module.exports = function bar () {};
```

### Exporting in ES6

**Named Exports:**

```
export function multiply (x, y) {  
  return x * y;  
};
```

As well as **exporting a list** of objects:

```
function add (x, y) {  
  return x + y;  
};  

function multiply (x, y) {  
  return x * y;  
};  

export { add, multiply };
```

**Default export:**

In our module, we can have many named exports, but we can also have a default export. It’s because our module could be a large library and with default export we can import then an entire module.

Important to note that there’s only `one default export per module`.

```
export default function (x, y) {  
  return x * y;  
};
```

This time we don’t have to use curly braces for importing and we have a chance to name imported statement as we wish.

```
import multiply from 'module';  
// === OR ===  
import whatever from 'module';
```

A module can have both named exports and a default export:

```
// module.js  
export function add (x, y) {  
  return x + y;  
};  
export default function (x, y) {  
  return x * y;  
};  

// app.js  
import multiply, { add } from 'module';
```

The default export is just a named export with the special name default.

```
// module.js  
export default function (x, y) {  
  return x * y;  
};  

// app.js  
import { default } from 'module';
```

### Importing in ES6

```
import { add } from 'module';
```

We can even import many statements:

```
import { add, multiply } from 'module';
```

Imports may also be **aliased**:

```
import {   
  add as addition,   
  multiply as multiplication  
} from 'module';
```

and use wildcard (`*`) to import all exported statemets:

```
import * from 'module';
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
