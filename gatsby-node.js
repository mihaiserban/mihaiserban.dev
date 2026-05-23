const _ = require(`lodash`);
const path = require("path");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      projects: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/projects/" } }
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
      blogs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/blog/" } }
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  const projectTemplate = path.resolve(`./src/templates/project.js`);
  _.each(result.data.projects.edges, (edge) => {
    createPage({
      path: `/project/${edge.node.frontmatter.slug}/`,
      component: projectTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });

  const blogTemplate = path.resolve(`./src/templates/blog.js`);
  _.each(result.data.blogs.edges, (edge) => {
    createPage({
      path: `/blog/${edge.node.frontmatter.slug}/`,
      component: blogTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });
};
