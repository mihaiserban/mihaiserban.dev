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
  const { edges: posts } = data.allContentfulBlogPost;
  const meta = data.site.siteMetadata;

  console.log(data);
  return (
    <div>
      <main>
        <Helmet title={meta.defaultTitle}>
          <meta name="twitter:title" content={meta.defaultTitle} />
          <meta name="twitter:description" content={meta.defaultDescription} />
        </Helmet>
        <Section pt={[20, 40]}>
          <h1>
            Hello, my name is Jon.
{' '}
<br /> I am a web developer based in Paris.
          </h1>
        </Section>

        <SectionTitle>Recent articles</SectionTitle>
        {posts
          .map(({ node: post }) => (
            <Box mb={2} key={post.title}>
              <Text>
                <Link to={post.slug} style={{ color: 'black' }}>
                  {post.title}
                </Link>
              </Text>
            </Box>
          ))}
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
    allContentfulBlogPost {
      edges {
        node {
          title
          slug
          id
        }
      }
    }
  }
`;
