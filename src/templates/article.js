import React, { Component } from 'react';
import Helmet from 'react-helmet';
import ReactDisqusComments from 'react-disqus-comments';
import PageHeader from '../components/page-header';
import Markdown from '../components/markdown';

export default class Template extends Component {
  render() {
    const { data } = this.props;
    const meta = data.site.siteMetadata;
    if (!data) return null;

    console.log(data.contentfulBlogPost.createdAt);
    const disqusShortname = 'jonleopard';
    const url = `https://jonleopard.com/${data.contentfulBlogPost.slug}`;

    return (
      <main>
        <article>
          <Helmet
            title={`${data.contentfulBlogPost.title} - ${meta.defaultTitle}`}
          >
            <meta
              name="twitter:title"
              content={`${data.contentfulBlogPost.title} - ${
                meta.defaultTitle
              }`}
            />
            <meta
              name="twitter:description"
              content={data.contentfulBlogPost.excerpt}
            />
          </Helmet>
          <PageHeader
            title={data.contentfulBlogPost.title}
            subTitle={`By ${meta.author} on ${
              data.contentfulBlogPost.createdAt
            }`}
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
      createdAt(formatString: "DD MMMM YYYY")
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
