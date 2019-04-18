import React from 'react';
import { Link as GLink, graphql } from 'gatsby';
import { Flex, Box, Text, Link } from 'rebass';

import Layout from '../components/layout';

const Blog = ({ data }) => {
  const { edges: posts } = data.allContentfulBlogPost;

  return (
    <Layout>
      <Box width={1} pt={[20, 80]}>
        <Text fontSize={[4, 5, 6]} pb={4}>
          Blog
        </Text>
      </Box>
      <Flex flexDirection="column">
        <Box>
          {posts.map(({ node: post }) => (
            <Text fontSize={[2, 2, 3]} key={post.title} mb={3}>
              <Link as={GLink} to={post.slug} color="black">
                {post.title}
              </Link>
              <Box pt={2}>
                <Text fontSize={1} dateTime={post.date}>
                  {post.date}
                </Text>
              </Box>
            </Text>
          ))}
        </Box>
      </Flex>
    </Layout>
  );
};

export default Blog;

export const pageQuery = graphql`
  query BlogQuery {
    allContentfulBlogPost(sort: { fields: [date], order: DESC }) {
      edges {
        node {
          date(formatString: "DD MMMM YYYY")
          title
          slug
          id
        }
      }
    }
  }
`;
