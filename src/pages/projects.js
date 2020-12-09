import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";
import SEO from "../components/SEO";

const ProjectsIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <SEO title="Projects - Mihai Serban" />
      <div>
        <h1>Projects</h1>
        <div className="flex flex-col mt-8">
          {projects.map(({ node: project }, index) => {
            if (project.hidden && project.hidden === true) return null;
            return (
              <div className="flex flex-col" key={project.id}>
                <div className="flex flex-row projectContainer">
                  {project.previewImage &&
                    project.previewImage.file.contentType.indexOf("image") !==
                      -1 && (
                      <Link to={`/project/${project.slug}`} className=" mr-24">
                        {project.previewImage.localFile.extension === "svg" ? (
                          <img
                            className="imageProjects"
                            style={{ objectFit: "fill" }}
                            src={project.previewImage.localFile.publicURL}
                          />
                        ) : (
                          <Img
                            className="imageProjects"
                            fixed={project.previewImage.fixed}
                            alt={project.previewImage.title}
                            imgStyle={{
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </Link>
                    )}
                  <div className="flex flex-col">
                    <Link
                      to={`/project/${project.slug}`}
                      className="projectLink"
                    >
                      <h3>{project.title}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-secondary-color min-w-32">
                      {project.startDate} &nbsp;-&nbsp;
                      {project.endDate ? <>{project.endDate}</> : <>present</>}
                    </p>
                    {project.technologies !== null && (
                      <div className="tags flex flex-row flex-wrap mt-2">
                        {project.technologies.map(({ title }) => (
                          <Tag key={title}>{title}</Tag>
                        ))}
                      </div>
                    )}
                    {project.context && (
                      <p className="mt-2">
                        {project.context.childMarkdownRemark.excerpt}
                      </p>
                    )}
                  </div>
                </div>
                {index < projects.length - 1 && (
                  <div className="divider mb-8 mt-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>
        {`
          .tags {
            margin-left: -4px;
          }
          .divider {
            width: 100%;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent 0%,
              var(--separator-color) 30%,
              var(--separator-color) 70%,
              transparent 100%
            );
          }
          :global(.projectLink) {
            color: var(--primary-color);
          }
          :global(.projectLink:hover) {
            color: var(--textLink);
          }
          :global(.imageProjects) {
            min-width: 200px;
            width: 200px;
            max-height: 200px;
            height: auto;
            object-fit: contain;
          }
          /* If the screen size is 600px wide or less, hide the element */
          @media only screen and (max-width: 600px) {
            :global(.imageProjects) {
              width: 140px;
              max-height: 140px;
              margin-right: 16px;
            }
            .projectContainer {
              flex-direction: column;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default ProjectsIndex;

export const pageQuery = graphql`
  query ProjectsIndexQuery {
    allContentfulProject(sort: { fields: [endDate], order: DESC }) {
      edges {
        node {
          startDate(formatString: "DD MMMM YYYY")
          endDate(formatString: "DD MMMM YYYY")
          title
          slug
          id
          hidden
          context {
            childMarkdownRemark {
              html
              timeToRead
              excerpt
            }
          }
          images {
            title
            file {
              contentType
            }
            fixed(width: 200, quality: 90) {
              base64
              width
              height
              src
              srcSet
              srcWebp
              srcSetWebp
            }
          }
          previewImage {
            title
            file {
              contentType
            }
            fixed(width: 200, quality: 90) {
              base64
              width
              height
              src
              srcSet
              srcWebp
              srcSetWebp
            }
            localFile {
              extension
              publicURL
            }
          }
          technologies {
            title
          }
        }
      }
    }
  }
`;
