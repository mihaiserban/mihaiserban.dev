import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import { Flex, Box } from 'rebass';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1 } from '../components/text/headings';

const BlogIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <Box width={1}>
        <H1>Projects</H1>
      </Box>
      <Flex flexDirection="column">
        <Box>
          {projects.map(({ node: project }) => (
            <Link as={glink} to={`/project/${project.slug}`} color="black">
              {project.title}
            </Link>
          ))}
        </Box>
      </Flex>
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
