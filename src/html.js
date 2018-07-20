import React from 'react';

import favicon from 'static-assets/favicon.ico';
import twitterCard from 'static-assets/twitter-card.png';

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
          <link rel="shortcut icon" href={favicon} />
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


