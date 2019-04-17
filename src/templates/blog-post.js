import React from 'react';
import { graphql } from 'gatsby';
import ReactDisqusComments from 'react-disqus-comments';

import { Text, Box } from 'rebass';

import Markdown from '../components/markdown';
import Layout from '../components/layout';
import SEO from '../components/seo';
import PageHeader from '../components/page-header';

export default function Template({ data }) {
  if (!data) return null;
  console.log(data);

  const disqusShortname = 'jonleopard';
  const url = `https://jonleopard.com/${data.contentfulBlogPost.slug}`;

  return (
    <Layout>
      <SEO />
      <article>
        <Box width={1} pt={[20, 80]} pb={4}>
          <PageHeader
            pb={4}
            title={data.contentfulBlogPost.title}
            subTitle={`Written on ${data.contentfulBlogPost.date}`}
          />
        </Box>
        <Markdown
          dangerouslySetInnerHTML={{
            __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
          }}
        />
      </article>
      <ReactDisqusComments
        shortname={disqusShortname}
        identifier={data.contentfulBlogPost.title}
        title={data.contentfulBlogPost.title}
        url={url}
      />
    </Layout>
  );
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      body {
        childMarkdownRemark {
          html
          excerpt
        }
      }
      date(formatString: "DD MMMM YYYY")
      id
      slug
    }
  }
`;
