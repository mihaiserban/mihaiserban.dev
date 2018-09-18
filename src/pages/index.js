import React from "react";
import { Link, graphql } from "gatsby";
import Helmet from "react-helmet";
import { Box } from "grid-styled";
import styled from "styled-components";

import Layout from "components/layout";

const PostDate = styled.h3`
  font-size: 0.8em;
  display: block;
`;

const Index = ({ data }) => {
  const { edges: posts } = data.allContentfulBlogPost;
  const meta = data.site.siteMetadata;

  return (
    <main>
      <Layout>
        <Helmet title={meta.defaultTitle}>
          <meta name="twitter:title" content={meta.defaultTitle} />
          <meta name="twitter:description" content={meta.defaultDescription} />
        </Helmet>
        <Box pt={[20, 40]}>
          <h1>
            Hello, my name is Jon. <br /> I am a web developer based in Paris.
          </h1>
        </Box>

        <h1>Recent articles</h1>
        {posts.map(({ node: post }) => (
          <Box mb={2} key={post.title}>
              <Link to={post.slug} style={{ color: "black" }}>
                {post.title}
                <PostDate is="time" dateTime={post.date}>
                  {post.date}
                </PostDate>
              </Link>
          </Box>
        ))}
      </Layout>
    </main>
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
