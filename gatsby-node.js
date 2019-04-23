const _ = require(`lodash`)
const slash = require(`slash`)
const path = require("path")


// get rid of slash
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return graphql(
    `
    {
      allContentfulBlogPost {
        edges {
          node {
            slug
            id
          }
        }
      }
    }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Grab template for blog posts
    const blogTemplate = path.resolve(`./src/templates/blog-post.js`)
    // For each result, create a page.
    _.each(result.data.allContentfulBlogPost.edges, edge => {
      createPage({
        path: `/blog/${edge.node.slug}/`,
        component: slash(blogTemplate),
        context: {
          slug: edge.node.slug,
          id: edge.node.id
        }
      });
    });
  });
};

  // return new Promise(resolve => {
  //   graphql(`
  //     {
  //       allContentfulBlogPost {
  //         edges {
  //           node {
  //             slug
  //           }
  //         }
  //       }
  //     }
  //   `).then(result => {
  //     result.data.allContentfulBlogPost.edges.forEach(({ node }) => {
  //       createPage({
  //         path: node.slug,
  //         component: path.resolve('./src/templates/blog-post.js'),
  //         context: {
  //           slug: node.slug,
  //         },
  //       })
  //     })
  //     resolve()
  //   })
  // })
  // }

// exports.onCreateWebpackConfig = ({ stage, actions }) => {
//   actions.setWebpackConfig({
//     resolve: {
//       modules: [path.resolve(__dirname, 'src'), 'node_modules'],
//     },
//   })
// }
