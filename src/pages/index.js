import React from "react";
import { Link, graphql } from "gatsby";
import Helmet from "react-helmet";
import { Box, Heading, Text } from "jonleopard-design-system";
import styled from "styled-components";

import Layout from "components/layout";

const Index = ({ data }) => {
  const { edges: posts } = data.allContentfulBlogPost;
  const meta = data.site.siteMetadata;

  return (
    <Layout>
      <Helmet title={meta.defaultTitle}>
        <meta name="twitter:title" content={meta.defaultTitle} />
        <meta name="twitter:description" content={meta.defaultDescription} />
      </Helmet>
      <Box width={1} pt={[20, 40]}>
        <Heading fontSize={[4,5,7]}>
          Hello, my name is Jon. <br /> I am a web developer based in Paris.
        </Heading>
      </Box>

      <Box pt={[20, 50]} pb={[20, 20]}>
        <Heading regular fontSize={[2, 2, 3]}>
          Recent articles
        </Heading>
      </Box>
      <Box width={[1, 1, 1]}>
        {posts.map(({ node: post }) => (
          <Text fontSize={[2,2,2]} key={post.title}>
            <Link to={post.slug} color="primary">
              {post.title}
              <Box pb={3}>
                <Text is="time" dateTime={post.date}>
                  {post.date}
                </Text>
              </Box>
            </Link>
          </Text>
        ))}
      </Box>
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
