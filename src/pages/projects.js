import React from "react";
import { graphql } from "gatsby";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";
import SEO from "../components/SEO";
import "../styles/scss/pages/projects.scss";

const ProjectsIndex = ({ data }) => {
  const { edges: projects } = data.allMarkdownRemark;

  return (
    <Layout>
      <SEO title="Projects - Mihai Serban" />
      <div>
        <h1>Projects</h1>
        <div className="flex flex-col mt-8">
          {projects.map(({ node: project }, index) => {
            if (project.frontmatter.hidden && project.frontmatter.hidden === true) return null;
            return (
              <div className="flex flex-col" key={project.frontmatter.slug}>
                <div className="flex flex-row projectContainer">
                  {project.frontmatter.previewImage && (
                    <Link to={`/project/${project.frontmatter.slug}`} className=" mr-24">
                      <img
                        className="imageProjects"
                        style={{ objectFit: "fill" }}
                        src={project.frontmatter.previewImage}
                        alt={project.frontmatter.title}
                      />
                    </Link>
                  )}
                  <div className="flex flex-col">
                    <Link
                      to={`/project/${project.frontmatter.slug}`}
                      className="projectLink"
                    >
                      <h3>{project.frontmatter.title}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-secondary-color min-w-32">
                      {project.frontmatter.startDate}&nbsp;-&nbsp;
                      {project.frontmatter.endDate ? <>{project.frontmatter.endDate}</> : <>present</>}
                    </p>
                    {project.frontmatter.technologies !== null && (
                      <div className="tags flex flex-row flex-wrap mt-2">
                        {project.frontmatter.technologies.map((title) => (
                          <Tag key={title}>{title}</Tag>
                        ))}
                      </div>
                    )}
                    {project.excerpt && (
                      <p className="mt-2">
                        {project.excerpt}
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
    </Layout>
  );
};

export default ProjectsIndex;

export const pageQuery = graphql`
  query ProjectsIndexQuery {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/projects/" } }
      sort: { frontmatter: { endDate: DESC } }
    ) {
      edges {
        node {
          frontmatter {
            startDate(formatString: "DD MMMM YYYY")
            endDate(formatString: "DD MMMM YYYY")
            title
            slug
            hidden
            technologies
            previewImage
          }
          excerpt
        }
      }
    }
  }
`;
