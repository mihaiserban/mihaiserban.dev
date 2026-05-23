import React from "react";
import { graphql } from "gatsby";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";
import SEO from "../components/SEO";
import "../styles/scss/pages/about.scss";

const Page = ({ data }) => {
  const { dataJson: aboutJson, allEducationJson } = data;
  const { edges: experience } = data.allMarkdownRemark;

  return (
    <Layout>
      <SEO title="About me - Mihai Serban" />
      <div>
        <h1>About me</h1>
        <div
          className="mt-4 md-remark"
          dangerouslySetInnerHTML={{
            __html: aboutJson.body,
          }}
        />
        <div className="flex flex-col mt-6">
          <h2>Education</h2>
          <div className="flex flex-col">
            {allEducationJson && allEducationJson.nodes && allEducationJson.nodes.map((item) => (
              <div key={item.title} className="flex flex-col">
                <span className="mt-2">{item.title}</span>
                <span className="mt-1 text-sm text-secondary-color min-w-32">
                  {item.startDate}
                  &nbsp;-&nbsp;
                  {item.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col mt-6">
          <h2>Platforms</h2>
          <div className="tags flex flex-row flex-wrap mt-2">
            {aboutJson.platforms && aboutJson.platforms.map((title) => (
              <Tag key={title}>{title}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-col mt-6">
          <h2>Experience</h2>
          <div className="flex flex-col">
            {experience && experience.map(({ node: item }, index) => (
              <div className="flex flex-col mt-4" key={item.frontmatter.title + '-' + (item.frontmatter.company || 'unknown')}>
                <h4>
                  {item.frontmatter.title}
                  {item.frontmatter.company && (
                    <>
                      &nbsp;-&nbsp;
                      {item.frontmatter.company}
                    </>
                  )}
                </h4>
                <span className="mt-1 text-sm text-secondary-color min-w-32">
                  {item.frontmatter.startDate} &nbsp;-&nbsp;
                  {item.frontmatter.endDate ? <>{item.frontmatter.endDate}</> : <>present</>}
                </span>
                <div
                  className="md-remark"
                  dangerouslySetInnerHTML={{
                    __html: item.html,
                  }}
                />
                {item.frontmatter.projects && item.frontmatter.projects.length > 0 && (
                  <>
                    <h5 className="mt-4">Projects</h5>
                    <ul className="mt-1">
                      {item.frontmatter.projects.map((project) => {
                        if (project.hidden && project.hidden === true) {
                          return null;
                        }
                        return (
                          <li key={project.slug}>
                            <div className="flex flex-row items-center">
                              <Link to={`/project/${project.slug}`}>
                                <span>{project.title}</span>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {index < experience.length - 1 && (
                  <div className="divider mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;

export const pageQuery = graphql`
  query AboutPageQuery {
    dataJson {
      platforms
      body
      image
    }
    allEducationJson(sort: { startDate: DESC }) {
      nodes {
        title
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
      }
    }
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/experience/" } }
      sort: { frontmatter: { startDate: DESC } }
    ) {
      edges {
        node {
          frontmatter {
            title
            company
            startDate(formatString: "DD MMMM YYYY")
            endDate(formatString: "DD MMMM YYYY")
            projects {
              slug
              title
              hidden
            }
          }
          html
        }
      }
    }
  }
`;
