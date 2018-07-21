import React from 'react';

import faviconShortcut from 'favicon.ico';
import faviconSmall from 'favicons/favicon-16x16.png';
import faviconMedium from 'favicons/favicon-32x32.png';
import faviconApple from 'favicons/apple-touch-icon.png';
import faviconAndroid from 'favicons/android-chrome-192x192.png';
import faviconAndroidChrome from 'favicons/android-chrome-256x256.png';
import manifest from './site.webmanifest';
import maskIcon from 'favicons/safari-pinned-tab.svg';

import twitterCard from 'static/social/twitter-card.png';

let stylesStr;
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!../public/styles.css`);
  } catch (e) {
    console.log(e);
  }
}

module.exports = class HTML extends React.Component {
  render() {
    const data = {this.props};
    let css;
    if (process.env.NODE_ENV === `production`) {
      css = (
        <style
          id="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: stylesStr }}
        />
      );
    }
    return (
      <html {...this.props.htmlAttributes}>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="shortcut icon" href={faviconShortcut} />
          <link rel="icon" href={faviconSmall} />
          <link rel="icon" href={faviconMedium} />
          <link rel="icon" href={faviconApple} />
          <link rel="icon" href={faviconAndroid} />
          <link rel="icon" href={faviconAndroidChrome} />
          <link rel="manifest" href={manifest} />
          <meta name="msapplication-TileColor" content="#603cba">
          <meta name="theme-color" content="#F59Af0" />
          <meta name="author" content="Jon Leopard" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          /> 
         
          {/* Twitter Card tags */} 
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@jonlprd" />
          <meta name="twitter:creator" content="@jonlprd" />
          <meta name="twitter:title" content="Jon Leopard | Web Developer" />
          <meta
            name="twitter:image"
            content={`https://jonleopard.com${twitterCard}`}
          />
          {this.props.headComponents}
          {css}
        </head>
        <body {...this.props.bodyAttributes}>
          {this.props.preBodyComponents}
          <div
            key="body"
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    );
  }
};


