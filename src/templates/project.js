import React, { useState } from "react";
import { graphql } from "gatsby";
import ReactPlayer from "react-player";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Lightbox from "react-image-lightbox";
import Layout from "../components/layout";
import SEO from "../components/SEO";

import Link from "../components/link";

import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

const Template = ({ data }) => {
  if (!data) return null;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const project = data.contentfulProject;

  const filteredImages = project.images.filter(
    image => image.file.contentType.indexOf("image") !== -1
  );
  const filteredVideos = project.images.filter(
    image => image.file.contentType.indexOf("video") !== -1
  );
  const images = filteredImages.map(image => image.file.url);

  return (
    <Layout>
      <SEO />
      <article>
        <div>
          <div className="flex-parent flex-parent--row flex-parent--center-cross">
            <h1>{project.title}</h1>
            {project.url !== null && (
              <Link to={project.url} className="ml16">
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  color="var(--primary-color)"
                />
              </Link>
            )}
          </div>
          <span className="mt4">
            {project.startDate} &nbsp;-&nbsp;
            {project.endDate ? <>{project.endDate}</> : <>present</>}
          </span>

          {project.context !== null && (
            <div className="flex-parent flex-parent--column mt16">
              <h5>Context</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: project.context.childMarkdownRemark.html
                }}
                id="top"
                className="content"
              />
            </div>
          )}

          {project.technologies !== null && (
            <div className="flex-parent flex-parent--column mt16">
              <h5>Technologies</h5>
              <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
                {project.technologies.map(({ title }) => (
                  <span className="tag" key={title}>
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.industries !== null && (
            <div className="flex-parent flex-parent--column mt16">
              <h5>Industry</h5>
              <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
                {project.industries.map(({ title }) => (
                  <span className="tag" key={title}>
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.platforms !== null && (
            <div className="flex-parent flex-parent--column mt16">
              <h5>Platforms</h5>
              <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
                {project.platforms.map(({ title }) => (
                  <span className="tag" key={title}>
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.responsabilities !== null && (
            <div className="flex-parent flex-parent--column mt16">
              <h5>Responsabilities</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: project.responsabilities.childMarkdownRemark.html
                }}
                id="top"
                className="content"
              />
            </div>
          )}

          {(filteredVideos.length > 0 || filteredImages.length > 0) && (
            <div className="flex-parent flex-parent--column flex-parent--center-main mt16">
              {filteredVideos.length > 0 && (
                <>
                  <h5 className="mb16">Video</h5>
                  {filteredVideos.map(image => (
                    <ReactPlayer
                      key={image.file.url}
                      url={image.file.url}
                      controls
                      width="100%"
                      height="auto"
                      className="mb24 noselect video"
                    />
                  ))}
                </>
              )}
              {filteredImages.length > 0 && (
                <>
                  <h5 className="mb16">Gallery</h5>
                  <img
                    className="imageProject mb24"
                    src={filteredImages[0].file.url}
                    alt={filteredImages[0].title}
                    onClick={() => setIsOpen(true)}
                  />
                </>
              )}
            </div>
          )}

          {isOpen && (
            <Lightbox
              mainSrc={images[photoIndex]}
              nextSrc={images[(photoIndex + 1) % images.length]}
              prevSrc={images[(photoIndex + images.length - 1) % images.length]}
              onCloseRequest={() => setIsOpen(false)}
              onMovePrevRequest={() =>
                setPhotoIndex((photoIndex + images.length - 1) % images.length)
              }
              onMoveNextRequest={() =>
                setPhotoIndex((photoIndex + 1) % images.length)
              }
              imagePadding={64}
              enableZoom={true}
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
          .imageProject {
            max-width: 100%;
            height: auto;
            max-height: 50vw;
            object-fit: cover;
            cursor: pointer;
            border: 1px solid var(--separator-color);
          }
          :global(.video) {
            border: 1px solid var(--separator-color);
          }
          .tags {
            margin-left: -4px;
          }
          .tag {
            padding-top: 2px;
            padding-bottom: 2px;
            padding-left: 12px;
            padding-right: 12px;
            border: 1px solid var(--separator-color);
            border-radius: 15px;
            margin: 4px;
            font-size: 12px;
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
      url
      context {
        childMarkdownRemark {
          html
          timeToRead
          excerpt
        }
      }
      responsabilities {
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
      platforms {
        title
      }
      industries {
        title
      }
    }
  }
`;
