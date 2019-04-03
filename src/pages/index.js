import React from 'react';
import { Link as GLink, graphql } from 'gatsby';
import Helmet from 'react-helmet';
import { Flex, Box, Heading, Text, Link } from 'jonleopard-design-system';

import Layout from '../components/layout';

const Index = ({ data }) => {
  const { edges: posts } = data.allContentfulBlogPost;
  const meta = data.site.siteMetadata;

  return (
    <Layout>
      <Helmet title={meta.defaultTitle}>
        <meta name="twitter:title" content={meta.defaultTitle} />
        <meta name="twitter:description" content={meta.defaultDescription} />
      </Helmet>
      <Box width={1} pt={[20, 80]}>
        <Heading fontSize={[4, 5, 6]}>
          Hello, my name is Jon. <br /> I am a web developer based in Paris.
        </Heading>
      </Box>

      <Box pt={[20, 50]} pb={[20, 20]}>
        <Heading regular fontSize={[2, 2, 3]}>
          Recent articles
        </Heading>
      </Box>
      <Flex flexDirection="column">
        <Box>
          {posts.map(({ node: post }) => (
            <Text fontSize={2} key={post.title}>
              <Link as={GLink} to={post.slug} color="black">
                {post.title}
              </Link>
              <Box pb={3}>
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

export default Index;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        defaultTitle
        defaultDescription
      }
    }
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
