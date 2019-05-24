import React from 'react';
import { graphql } from 'gatsby';
import ReactPlayer from 'react-player';

import Markdown from '../components/markdown';
import Layout from '../components/layout';
import SEO from '../components/SEO';

import { H1 } from '../components/text/headings';

const Template = ({ data }) => {
  if (!data) return null;
  const project = data.contentfulProject;
  return (
    <Layout>
      <SEO />
      <article className="pl32 pr32">
        <div>
          <div className="flex-parent flex-parent--column">
            <H1>{project.title}</H1>
          </div>
          <span className="fw2 f6 mt4">
            {project.startDate} -
{project.endDate}
          </span>
          <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
            {project.technologies.map(({ title }) => (
              <span className="tag fw2 f6">{title}</span>
            ))}
          </div>
          <Markdown
            dangerouslySetInnerHTML={{
              __html: project.body.childMarkdownRemark.html,
            }}
            id="top"
            className="content"
          />
          <div className="flex-parent flex-parent--column flex-parent--center-main">
            {project.images.map((image, index) => (
              <>
                {image.file.contentType.indexOf('video') !== -1 ? (
                  <ReactPlayer
                    url={image.file.url}
                    controls
                    width="100%"
                    height="auto"
                    className="mb24"
                  />
                ) : (
                  <img className="image mb24" src={image.file.url} alt={image.title} />
                )}
              </>
            ))}
          </div>
        </div>
      </article>
      <style jsx>
        {`
          .video-container {
            width: 100%;
            height: auto;
          }
          .image {
            max-width: 100%;
            height: auto;
            object-fit: contain;
          }
          .tags {
            margin-left: -4px;
          }
          .tag {
            padding-top: 3px;
            padding-bottom: 3px;
            padding-left: 8px;
            padding-right: 8px;
            border: 1px solid #e6e6e6;
            border-radius: 15px;
            margin: 4px;
          }
        `}
      </style>
    </Layout>
  );
};

export default Template;

export const pageQuery = graphql`
  query ProjectQuery($slug: String!) {
    contentfulProject(slug: { eq: $slug }) {
      startDate(formatString: "DD MMMM YYYY")
      endDate(formatString: "DD MMMM YYYY")
      title
      slug
      id
      body {
        childMarkdownRemark {
          html
          timeToRead
          excerpt
        }
      }
      images {
        title
        file {
          url
          contentType
        }
      }
      previewImage {
        title
        file {
          url
          contentType
        }
      }
      technologies {
        title
      }
    }
  }
`;
