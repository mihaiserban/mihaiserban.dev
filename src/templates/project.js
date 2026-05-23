import React, { useState, useEffect } from "react";
import { graphql } from "gatsby";
import ReactPlayer from "react-player";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Layout from "../components/layout";
import SEO from "../components/SEO";
import Tag from "../components/tag";
import Link from "../components/link";
import "../styles/scss/templates/project.scss";

// Lazy load Lightbox only on client side to avoid SSR issues
let Lightbox = null;
if (typeof window !== "undefined") {
  Lightbox = require("react-image-lightbox").default;
  require("react-image-lightbox/style.css");
}

const Template = ({ data }) => {
  if (!data) return null;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const project = data.markdownRemark;

  const filteredImages = project.frontmatter.gallery.filter(
    (image) => image.endsWith('.jpg') || image.endsWith('.png') || image.endsWith('.jpeg') || image.endsWith('.svg')
  );
  const filteredVideos = project.frontmatter.gallery.filter(
    (image) => image.endsWith('.mp4') || image.endsWith('.mov')
  );
  const images = filteredImages;

  return (
    <Layout>
      <SEO
        title={`${project.frontmatter.title} - ${project.frontmatter.platforms
          .join(", ")} - Mihai Serban`}
        description={project.excerpt}
      />
      <article>
        <div>
          <div className="flex flex-row items-center">
            <h1>{project.frontmatter.title}</h1>
            {project.frontmatter.url !== null && (
              <Link to={project.frontmatter.url} className="ml-4">
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  color="var(--primary-color)"
                />
              </Link>
            )}
          </div>
          <span className="mt-2 text-sm text-secondary-color min-w-32">
            {project.frontmatter.startDate}&nbsp;-&nbsp;
            {project.frontmatter.endDate ? <>{project.frontmatter.endDate}</> : <>present</>}
          </span>

          {project.html !== null && (
            <div className="flex flex-col mt-4">
              <div
                dangerouslySetInnerHTML={{
                  __html: project.html,
                }}
                className="md-remark"
              />
            </div>
          )}

          {project.frontmatter.technologies !== null && (
            <div className="flex flex-col mt-4">
              <h5>Technologies</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.frontmatter.technologies.map((title) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {project.frontmatter.industries !== null && project.frontmatter.industries.length > 0 && (
            <div className="flex flex-col mt-4">
              <h5>Industry</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.frontmatter.industries.map((title) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {project.frontmatter.platforms !== null && (
            <div className="flex flex-col mt-4">
              <h5>Platforms</h5>
              <div className="tags flex flex-row flex-wrap mt-2">
                {project.frontmatter.platforms.map((title) => (
                  <Tag key={title}>{title}</Tag>
                ))}
              </div>
            </div>
          )}

          {(filteredVideos.length > 0 || filteredImages.length > 0) && (
            <div className="flex flex-col justify-center mt-4">
              {filteredVideos.length > 0 && (
                <>
                  <h5 className="mb-4">Video</h5>
                  {filteredVideos.map((videoUrl) => (
                    <ReactPlayer
                      key={videoUrl}
                      url={videoUrl}
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
                    src={filteredImages[0]}
                    alt={project.frontmatter.title}
                    onClick={() => setIsOpen(true)}
                  />
                </>
              )}
            </div>
          )}

          {isOpen && Lightbox && (
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
    </Layout>
  );
};

export default Template;

export const pageQuery = graphql`
  query ProjectQuery($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
        title
        slug
        url
        technologies
        platforms
        industries
        gallery
        previewImage
      }
      html
      excerpt
    }
  }
`;
