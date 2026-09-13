---
slug: how-to-fix-broken-images-in-react
title: How to fix broken images in React.
description: In one of my recent projects we encountered many images which were missing from our S3 bucket. When I see something like this it just makes me sick 😫.
date: "2018-10-25T00:00+02:00"
hidden: false
tags:
  - React
  - JavaScript
---

![Missing image example](/images/blog/1_xIlLqtM0dSTY3KZ03zckMg.png)

In one of my recent projects we encountered many images which were missing from our S3 bucket. When I see something like this it just makes me sick 😫.

`<img>` provides us with two events, `onLoad` and `onError`. We can use these two to keep track of the status of the image.

`onError` is called when our image has failed to load, and we can set `src` to our preferred fallback image.

`onLoad` is called when our image loaded successfully, nothing for us to do here.

```
import React, { useEffect, useState } from "react";

function Image({
  src = "",
  placeholder = "",
  disableContextMenu = false,
  onError,
  onContextMenu,
  ...other
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  function handleImageError(event) {
    if (placeholder && imageSrc !== placeholder) {
      setImageSrc(placeholder);
    }
    onError?.(event);
  }

  function handleContextMenu(event) {
    onContextMenu?.(event);
    if (disableContextMenu) {
      event.preventDefault();
    }
  }

  return (
    <img
      src={imageSrc}
      onError={handleImageError}
      {...other}
      onContextMenu={handleContextMenu}
    />
  );
}

export default Image;
```

The [original 2018 version is also available as a Gist](https://gist.github.com/mihaiserban/751a84df361178db387e130d0c07693e).

> **Updated 2026-09-13:** The original example used `componentWillReceiveProps`, which is legacy React API. This version resets the image when `src` changes with an effect, and only attempts the fallback once.
