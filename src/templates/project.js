import React, { useState } from "react";
import { graphql } from "gatsby";
import ReactPlayer from "react-player";
import Lightbox from "react-image-lightbox";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Layout from "../components/layout";
import SEO from "../components/SEO";
import Tag from "../components/tag";
import Link from "../components/link";

import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

const Template = ({ data }) => {
  if (!data) return null;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const project = data.contentfulProject;

  const filteredImages = project.images.filter(
    (image) => image.file.contentType.indexOf("image") !== -1
  );
  const filteredVideos = project.images.filter(
    (image) => image.file.contentType.indexOf("video") !== -1
  );
  const images = filteredImages.map((image) => image.file.url);

  return (
    <Layout>
      <SEO
        title={`${project.title} - ${project.platforms
          .map((el) => el.title)
          .join(", ")} - Mihai Serban`}
        description={project.context.childMarkdownRemark.excerpt}
      />
      <article>
        <div>
          <div className="flex flex-row items-center">
            <h1>{project.title}</h1>
            {project.url !== null && (
              <Link to={project.url} className="ml-4">
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  color="var(--primary-color)"
                />
              </Link>
            )}
          </div>
          <span className="mt-2 text-sm text-secondary-color min-w-32">
            {project.startDate} &nbsp;-&nbsp;
            {project.endDate ? <>{project.endDate}</> : <>present</>}
          </span>

          {project.context !== null && (
            <div className="flex flex-col mt-4">
              <h5>Context</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: project.context.childMarkdownRemark.html,
                }}
                id="top"
                className="md-remark mt-2"
              />
            </div>
          )}

          {project.technologies !== null && (
            <div className="flex flex-col mt-4">
              <h5>Technologies</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.technologies.map(({ title }) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {project.industries !== null && (
            <div className="flex flex-col mt-4">
              <h5>Industry</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.industries.map(({ title }) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {project.platforms !== null && (
            <div className="flex flex-col mt-4">
              <h5>Platforms</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.platforms.map(({ title }) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {project.responsabilities !== null && (
            <div className="flex flex-col mt-4">
              <h5>Responsabilities</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: project.responsabilities.childMarkdownRemark.html,
                }}
                id="top"
                className="md-remark mt-2"
              />
            </div>
          )}

          {(filteredVideos.length > 0 || filteredImages.length > 0) && (
            <div className="flex flex-col justify-center mt-4">
              {filteredVideos.length > 0 && (
                <>
                  <h5 className="mb-4">Video</h5>
                  {filteredVideos.map((image) => (
                    <ReactPlayer
                      key={image.file.url}
                      url={image.file.url}
                      controls
                      width="100%"
                      height="auto"
                      className="mb-8 noselect video"
                    />
                  ))}
                </>
              )}
              {filteredImages.length > 0 && (
                <>
                  <h5 className="mb-4">Gallery</h5>
                  <img
                    className="imageProject mb-8"
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
