import React from 'react';
import { graphql } from 'gatsby';
import ReactDisqusComments from 'react-disqus-comments';
import Markdown from '../components/markdown';
import Layout from '../components/layout';
import { Text } from 'rebass';

export default function Template({ data }) {
  if (!data) return null;

  const disqusShortname = 'jonleopard';
  const url = `https://jonleopard.com/${data.contentfulBlogPost.slug}`;

  return (
    <Layout>
      <article>
        <Text
          title={data.contentfulBlogPost.title}
          subTitle={`Written on ${data.contentfulBlogPost.date}`}
        />
        <Markdown
          dangerouslySetInnerHTML={{
            __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
          }}
          id="top"
          className="content"
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
