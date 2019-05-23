import React from 'react';
import { Link as glink, graphql } from 'gatsby';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1 } from '../components/text/headings';

const BlogIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <H1>Projects</H1>
      <div className="flex-parent flex-parent--column mt32">
        {projects.map(({ node: project }) => (
          <div>
            <Link as={glink} to={`/project/${project.slug}`} color="black">
              {project.title}
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default BlogIndex;

export const pageQuery = graphql`
  query ProjectsIndexQuery {
    allContentfulProject(sort: { fields: [startDate], order: DESC }) {
      edges {
        node {
          startDate(formatString: "DD MMMM YYYY")
          endDate(formatString: "DD MMMM YYYY")
          title
          slug
          id
        }
      }
    }
  }
`;
