import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";
import SEO from "../components/SEO";

const startCareer = new Date("2010-05-01");

function diffYears(dt1, dt2) {
  return dt2.getFullYear() - dt1.getFullYear();
}

const Page = ({ data }) => {
  const { nodes: technologies } = data.allContentfulTechnologies;
  const { platforms, body, education, experience } = data.contentfulAbout;

  return (
    <Layout>
      <SEO title="About me - Mihai Serban" />
      <div>
        <h1>About me</h1>
        <div
          className="mt-4 md-remark"
          dangerouslySetInnerHTML={{
            __html: body.childMarkdownRemark.html,
          }}
        />
        <div className="flex flex-col mt-6">
          <h2>Education</h2>
          <div className="flex flex-col">
            {education.map((item) => (
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
            {platforms.map(({ title }) => (
              <Tag key={title}>{title}</Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-col mt-6">
          <h2>Experience</h2>
          <div className="flex flex-col">
            {experience.map((item, index) => (
              <div className="flex flex-col mt-4" key={item.company}>
                <h4>
                  {item.title}
                  {item.company && (
                    <>
                      &nbsp;-&nbsp;
                      {item.company}
                    </>
                  )}
                </h4>
                <span className="mt-1 text-sm text-secondary-color min-w-32">
                  {item.startDate} &nbsp;-&nbsp;
                  {item.endDate ? <>{item.endDate}</> : <>present</>}
                </span>
                <div
                  className="md-remark"
                  dangerouslySetInnerHTML={{
                    __html: item.jobDescription.childMarkdownRemark.html,
                  }}
                />
                {item.projects && item.projects.length > 0 && (
                  <>
                    <h5 className="mt-4">Projects</h5>
                    <ul className="mt-1">
                      {item.projects.map((project) => {
                        if (project.hidden && project.hidden === true) {
                          return null;
                        }
                        return (
                          <li>
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
        <div className="flex flex-col mt-6">
          <h2>Technologies</h2>
          <div className="flex flex-row flex-wrap mt-2">
            {technologies.map((tech) => (
              <div
                className="flex flex-col imageContainer items-center"
                key={tech.title}
              >
                <Img
                  fluid={tech.image.fluid}
                  alt={tech.title}
                  className="imageTech"
                  imgStyle={{
                    objectFit: "contain",
                    background: "var(--alternate-bg)",
                  }}
                />
                <span className="text mt-2.5">{tech.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .imageContainer {
            width: 120px;
            height: auto;
            margin-bottom: 16px;
            margin-left: -32px;
          }
          :global(.imageTech) {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border: 1px solid var(--separator-color);
          }
          .text {
            font-size: 0.8rem;
            line-height: 1.3em;
            font-weight: 300;
            letter-spacing: 0.5px;
            opacity: 0.8;
            text-align: center;
          }
          .tags {
            margin-left: -4px;
          }
          .divider {
            width: 100%;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent 0%,
              var(--separator-color) 10%,
              var(--separator-color) 90%,
              transparent 100%
            );
          }
        `}
      </style>
    </Layout>
  );
};

export default Page;

export const pageQuery = graphql`
  query AboutPageQuery {
    contentfulAbout {
      platforms {
        id
        title
      }
      body {
        childMarkdownRemark {
          html
        }
      }
      experience {
        id
        title
        company
        jobDescription {
          childMarkdownRemark {
            html
          }
        }
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
        projects {
          id
          startDate(formatString: "DD MMMM YYYY")
          endDate(formatString: "DD MMMM YYYY")
          title
          slug
          hidden
        }
      }
      education {
        id
        title
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
      }
    }
    allContentfulTechnologies(sort: { fields: [createdAt], order: DESC }) {
      nodes {
        id
        title

        image {
          fluid(maxWidth: 980) {
            base64
            tracedSVG
            aspectRatio
            src
            srcSet
            srcWebp
            srcSetWebp
            sizes
          }
        }
      }
    }
  }
`;
