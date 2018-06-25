const path = require('path');

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allContentfulBlogPost {
          edges {
            node {
              slug
            }
          }
        }
      }
    `).then(result => {
      result.data.allContentfulBlogPost.edges.forEach(({ node }) => {
        createPage({
          path: node.slug,
          component: path.resolve('./src/templates/article.js'),
          context: {
            slug: node.slug,
          },
        });
      });
      resolve();
    });
  });
};

exports.modifyWebpackConfig = ({ config, env }) => {
  config.merge({
    resolve: {
      root: path.resolve(__dirname, './src'),
      extensions: ['', '.js', '.jsx', '.json'],
    },
  });
  return config;
};
