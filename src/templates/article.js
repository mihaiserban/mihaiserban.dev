import React from 'react';
import Helmet from 'react-helmet';
import { graphql } from 'gatsby';
import ReactDisqusComments from 'react-disqus-comments';
import PageHeader from 'components/page-header';
import Markdown from 'components/markdown';
import Layout from 'components/layout';

export default function Template({ data }) {
  const meta = data.site.siteMetadata;
  if (!data) return null;

  const disqusShortname = 'jonleopard';
  const url = `https://jonleopard.com/${data.contentfulBlogPost.slug}`;

  return (
    <Layout>
      <article>
        <Helmet
          title={`${data.contentfulBlogPost.title} - ${meta.defaultTitle}`}
        >
          {/* Twitter Card tags */}
          <meta
            name="twitter:title"
            content={`${data.contentfulBlogPost.title} - Jon Leopard | Web Developer`}
          />
          <meta
            name="twitter:description"
            content={data.contentfulBlogPost.body.childMarkdownRemark.excerpt}
          />
        </Helmet>
        <PageHeader
          title={data.contentfulBlogPost.title}
          subTitle={`By ${meta.author} on ${data.contentfulBlogPost.date}`}
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
    site {
      siteMetadata {
        author
        defaultTitle
        defaultDescription
      }
    }
  }
`;
