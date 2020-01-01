const _ = require(`lodash`);
const slash = require(`slash`);
const path = require('path');

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(
    `
      {
        allContentfulProject {
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

    const projectTemplate = path.resolve(`./src/templates/project.js`);
    // For each result, create a page.
    _.each(result.data.allContentfulProject.edges, edge => {
      createPage({
        path: `/project/${edge.node.slug}/`,
        component: slash(projectTemplate),
        context: {
          slug: edge.node.slug,
          id: edge.node.id,
        },
      });
    });
  });
};
