const _ = require(`lodash`)
const slash = require(`slash`)
const path = require('path')

// get rid of slash
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
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
      throw result.errors
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
          id: edge.node.id,
        },
      })
    })
  })
}

