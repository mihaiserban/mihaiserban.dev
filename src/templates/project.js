import React, { useState } from 'react';
import { graphql } from 'gatsby';
import ReactPlayer from 'react-player';

import Lightbox from 'react-image-lightbox';
import Markdown from '../components/markdown';
import Layout from '../components/layout';
import SEO from '../components/SEO';

import { H1, H5 } from '../components/text/headings';

import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

const Template = ({ data }) => {
  if (!data) return null;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const project = data.contentfulProject;

  const filteredImages = project.images.filter(
    image => image.file.contentType.indexOf('image') !== -1
  );
  const filteredVideos = project.images.filter(
    image => image.file.contentType.indexOf('video') !== -1
  );
  const images = filteredImages.map(image => image.file.url);

  return (
    <Layout>
      <SEO />
      <article>
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
            className="content mt16"
          />
          <div className="flex-parent flex-parent--column flex-parent--center-main">
            {filteredVideos.length > 0 && (
              <>
                <H5 className="mb16">Video</H5>
                {filteredVideos.map(image => (
                  <ReactPlayer
                    url={image.file.url}
                    controls
                    width="100%"
                    height="auto"
                    className="mb24 noselect"
                  />
                ))}
              </>
            )}
            {filteredImages.length > 0 && (
              <>
                <H5 className="mb16">Images</H5>
                <img
                  className="image mb24"
                  src={filteredImages[0].file.url}
                  alt={filteredImages[0].title}
                  onClick={() => setIsOpen(true)}
                />
              </>
            )}
          </div>
          {isOpen && (
            <Lightbox
              mainSrc={images[photoIndex]}
              nextSrc={images[(photoIndex + 1) % images.length]}
              prevSrc={images[(photoIndex + images.length - 1) % images.length]}
              onCloseRequest={() => setIsOpen(false)}
              onMovePrevRequest={() =>
                setPhotoIndex((photoIndex + images.length - 1) % images.length)
              }
              onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
              imagePadding={64}
              enableZoom={false}
            />
          )}
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
            cursor: pointer;
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
