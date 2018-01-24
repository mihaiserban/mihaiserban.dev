import React from 'react';
import Helmet from 'react-helmet';

import PageHeader from 'components/page-header';
import Markdown from 'components/markdown';

export default function Template({ data }) {
  const { markdownRemark: post } = data;
  const meta = data.site.siteMetadata;

  const dateToday = new Date();
  const datePost = new Date(post.fields.date);

  return (
    <main>
      <article>
        <Helmet title={`${post.frontmatter.title} - ${meta.defaultTitle}`}>
          <meta
            name="twitter:title"
            content={`${post.frontmatter.title} - ${meta.defaultTitle}`}
          />
          <meta name="twitter:description" content={post.excerpt} />
        </Helmet>
        <PageHeader
          title={post.frontmatter.title}
          subTitle={`By ${meta.author} on ${post.fields.date}`}
        />
        <Markdown
          dangerouslySetInnerHTML={{ __html: post.html }}
          id="top"
          className="content"
        />
      </article>
    </main>
  );
}

export const pageQuery = graphql`
  query BlogPostByPath($slug: String!) {
    site {
      siteMetadata {
        author
        defaultTitle
        defaultDescription
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        date(formatString: "DD MMM, YYYY")
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
