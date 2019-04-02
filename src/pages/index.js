import React from 'react';
import { graphql, Link as GLink } from 'gatsby';
import { Flex, Box, Text, Link } from 'rebass';

import SEO from '../components/seo';
import Layout from 'components/layout';

const Index = ({ data }) => {
  const { edges: posts } = data.allContentfulBlogPost;

  return (
    <>
      <Layout>
        <SEO />
        <Box width={1} pt={[20, 80]}>
          <Text fontSize={[4, 5, 6]} fontWeight="bold">
            Hello, my name is Jon. <br /> I am a web developer based in Paris.
          </Text>
        </Box>

        <Box pt={[20, 50]} pb={[20, 20]}>
          <Text fontSize={[2, 2, 3]}>Recent articles</Text>
        </Box>
        <Flex>
          <Box>
            {posts.map(({ node: post }) => (
              <Box key={post.title}>
                <Link color="black" as={GLink} to={post.slug}>
                  {post.title}
                </Link>
                <Box pb={3}>
                  <Text fontSize={1} dateTime={post.date}>
                    {post.date}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Flex>
      </Layout>
    </>
  );
};

export default Index;

export const pageQuery = graphql`
  query IndexQuery {
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
