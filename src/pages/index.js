import React from 'react';
import Link from 'gatsby-link';
import Helmet from 'react-helmet';
import { Box } from 'grid-styled';
import styled from 'styled-components';

import { Text, P } from '../components/typography';
import Section, { SectionTitle } from '../components/section';

// import svgAnimation from '../assets/images/icon.svg';

const PostDate = styled(Text)`
  font-size: 0.8em;
  display: block;
`;

const Index = ({ data }) => {
  const { edges: posts } = data.allMarkdownRemark;
  const meta = data.site.siteMetadata;
  return (
    <div>
      <main>
        <Helmet title={meta.defaultTitle}>
          <meta name="twitter:title" content={meta.defaultTitle} />
          <meta name="twitter:description" content={meta.defaultDescription} />
        </Helmet>
        <Section pt={[20, 40]}>
          <h1>
            Hello, my name is Jon. <br /> I am a web developer based in Paris.
          </h1>
        </Section>
        <Section>
          <SectionTitle>Recent articles</SectionTitle>
          {posts
            .filter(post => post.node.frontmatter.title.length > 0)
            .map(({ node: post }) => (
              <Box mb={2} key={post.frontmatter.title}>
                <Text>
                  <Link to={post.fields.slug} style={{ color: 'black' }}>
                    {post.frontmatter.title}
                    <PostDate is="time" dateTime={post.fields.date}>
                      {post.fields.date}
                    </PostDate>
                  </Link>
                </Text>
              </Box>
            ))}
        </Section>
      </main>
    </div>
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
    allMarkdownRemark(sort: { fields: [fields___date], order: DESC }) {
      edges {
        node {
          excerpt(pruneLength: 250)
          id
          fields {
            date(formatString: "DD MMMM, YYYY")
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`;
