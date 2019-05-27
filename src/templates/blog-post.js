import React from 'react';
import { graphql } from 'gatsby';

import Markdown from '../components/markdown';
import Layout from '../components/layout';
import SEO from '../components/SEO';

import { H1 } from '../components/text/headings';

const Template = ({ data }) => {
  if (!data) return null;
  return (
    <Layout>
      <SEO />
      <article>
        <>
          <div className="flex-parent flex-parent--column">
            <span>
              Written on
              {data.contentfulBlogPost.date}
            </span>
            <H1>{data.contentfulBlogPost.title}</H1>
          </div>
          <Markdown
            dangerouslySetInnerHTML={{
              __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
            }}
            id="top"
            className="content"
          />
        </>
      </article>
    </Layout>
  );
};

export default Template;

export const pageQuery = graphql`
  query BlogPostQuery($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      id
      slug
      date(formatString: "DD MMMM YYYY")
      body {
        childMarkdownRemark {
          html
          excerpt
        }
      }
    }
  }
`;
