import React from 'react';
import Helmet from 'react-helmet';
import ReactDisqusComments from 'react-disqus-comments';
import twitterCard from 'static-assets/twitter-card.png';
import PageHeader from 'components/page-header';
import Markdown from 'components/markdown';

export default function Template({ data }) {
  const meta = data.site.siteMetadata;
  if (!data) return null;

  const disqusShortname = 'jonleopard';
  const url = `https://jonleopard.com/${data.contentfulBlogPost.slug}`;

  return (
    <main>
      <article>
        <Helmet
          title={`${data.contentfulBlogPost.title} - ${meta.defaultTitle}`}
        >
          {/* OpenGraph tags */}
          <meta property="og:url" content="https://jonleopard.com" />
          <meta property="og:type" content="article" />
          <meta
            property="og:title"
            content={`${data.contentfulBlogPost.title} - ${meta.defaultTitle}`}
          />
          <meta
            property="og:description"
            content={data.contentfulBlogPost.body.childMarkdownRemark.excerpt}
          />
          <meta
            property="og:image"
            content={`https://jonleopard.com${twitterCard}`}
          />
          {/* Twitter Card tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@jonlprd" />
          <meta
            name="twitter:title"
            content={`${data.contentfulBlogPost.title} - ${meta.defaultTitle}`}
          />
          <meta
            name="twitter:description"
            content={data.contentfulBlogPost.body.childMarkdownRemark.excerpt}
          />
          <meta
            name="twitter:image"
            content={`https://jonleopard.com${twitterCard}`}
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
    </main>
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
