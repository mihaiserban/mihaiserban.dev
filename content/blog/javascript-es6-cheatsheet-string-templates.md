---
slug: javascript-es6-cheatsheet-string-templates
title: ES6 cheatsheet — String Templates
description: "Template Strings use back-ticks (``) rather than the single or double quotes we’re used to with regular strings."
date: "2018-10-17T00:00+02:00"
hidden: false
tags:
  - JavaScript
  - ES6
---

![string_templates](/images/blog/1_OxzGYSWzbivvvMcTkbjC9w.png)

Template Strings use back-ticks (\`\`) rather than the single or double quotes we’re used to with regular strings. A template string could thus be written as follows:

```
const greeting = `Yo World!`;
```

**String Substitution**:

Substitution allows us to place any valid JavaScript expression inside a Template Literal, the result will be output as part of the same string.

Template Strings can contain placeholders for string substitution using the ${ } syntax:

```
var name = "Brendan";
console.log(`Yo, ${name}!`); //"Yo, Brendan!"
```

We can use expression interpolation to embed for some readable inline math:

```
var a = 10;
var b = 10;
console.log(`${a+b}`); //20
```

They are also very useful for functions inside expressions:

```
function fn() { return "inside fn"; }
console.log(`outside, ${fn()}, outside`); // outside, inside fn, outside.
```

__Multiline Strings:__

Multiline strings in JavaScript have required hacky workarounds for some time. Template Strings significantly simplify multiline strings. Simply include newlines where they are needed and BOOM.

```
let text = `In ES5 this is
not legal.`
```

__Unescaped template strings:__

We can now construct strings that have special characters in them without needing to escape them explicitly.

```
var text = "This string contains "double quotes" which are escaped.";
let text = `This string contains "double quotes" which don't need to be escaped anymore.`;
```

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻

