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

`<img>` provides us with two events, `onLoad` and `onError`. We can use these two keep track of the status of the image.

`onError` is called when our image has failed to load, and we can set `src` to our preferred fallback image.

`onLoad` is called when our image loaded successfully, nothing for us to do here.

```
import React from "react";  
import PropTypes from "prop-types";  

class Image extends React.Component {  
  constructor(props) {  
    super(props);  
    this.state = { src: props.src };  
  }  

  componentWillReceiveProps(nextProps) {  
    if (this.props.src !== nextProps.src) {  
      this.setState({  
        src: props.src  
      });  
    }  
  }  

  handleImageLoad() {  
    console.log("image loaded", this.state.src);  
  }  

  handleImageError() {  
    console.log("image failed loaded", this.state.src);  
    if (this.props.placeholder) {  
      console.log("try load placeholder");  
      this.setState({ src: this.props.placeholder });  
    }  
  }  

  handleOnContextMenu(e) {  
    console.log("handleOnContextMenu");  
    if (this.props.disableContextMenu) {  
      e.preventDefault();  
    }  
  }  

  render() {  
    const { src, placeholder, disableContextMenu, ...other } = this.props; // es7  

    return (  
      <img  
        src={this.state.src}  
        onLoad={this.handleImageLoad.bind(this)}  
        onError={this.handleImageError.bind(this)}  
        {...other}  
        onContextMenu={this.handleOnContextMenu.bind(this)}  
      />  
    );  
  }  
}  

Image.defaultProps = {  
  src: "",  
  placeholder: "",  
  disableContextMenu: false  
};  

Image.propTypes = {  
  src: PropTypes.string.isRequired,  
  placeholder: PropTypes.string,  
  disableContextMenu: PropTypes.bool  
};  

export default Image;
```

Also available as a [Gist](https://gist.github.com/mihaiserban/751a84df361178db387e130d0c07693e).

You can find a more complete ES6 cheetsheet on my [Github](https://github.com/mihaiserban/es6-cheetsheet/blob/master/README.md) page.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻
