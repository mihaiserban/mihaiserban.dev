import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import { Flex, Box, Text, Heading } from 'rebass';

import Link from '../components/link';
import Layout from '../components/layout';

const BlogIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <Text fontFamily="body">
        <Box width={1}>
          <Heading fontFamily="heading" fontSize={6} pb={4}>
            Blog
          </Heading>
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
      </Text>
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
