import React from "react";
import { Link as glink, graphql } from "gatsby";
import Img from "gatsby-image";

import Link from "../components/link";
import Layout from "../components/layout";

const startCareer = new Date("2010-05-01");

function diffYears(dt1, dt2) {
  return dt2.getFullYear() - dt1.getFullYear();
}

const Page = ({ data }) => {
  const { nodes: technologies } = data.allContentfulTechnologies;
  const { platforms, body, education, experience } = data.contentfulAbout;

  return (
    <Layout>
      <div>
        <h1>About me</h1>
        <div
          className="mt-4 md-remark"
          dangerouslySetInnerHTML={{
            __html: body.childMarkdownRemark.html,
          }}
        />
        <div className="flex-parent flex-parent--column mt-4">
          <h2>Education</h2>
          <div className="flex-parent flex-parent--column">
            {education.map((item) => (
              <div key={item.title} className="flex-parent flex-parent--column">
                <span className="mt-2">{item.title}</span>
                <span className="mt-4 italic">
                  {item.startDate}
                  &nbsp;-&nbsp;
                  {item.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt-4">
          <h2>Platforms</h2>
          <div className="tags flex-parent flex-parent--row flex-parent--wrap mt-2">
            {platforms.map(({ title }) => (
              <span className="tag" key={title}>
                {title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt-4">
          <h2>Technologies</h2>
          <div className="flex-parent flex-parent--row flex-parent--wrap mt-2">
            {technologies.map((tech) => (
              <div
                className="flex-parent flex-parent--column flex-parent--center-cross imageContainer"
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
                <span className="text mt-4">{tech.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt-4">
          <h2>Experience</h2>
          <div className="flex-parent flex-parent--column">
            {experience.map((item) => (
              <div
                className="flex-parent flex-parent--column"
                key={item.company}
              >
                <h5 className="mt-4">
                  {item.title}
                  {item.company && (
                    <>
                      &nbsp;-&nbsp;
                      {item.company}
                    </>
                  )}
                </h5>
                <span className="mt-4 italic">
                  {item.startDate} &nbsp;-&nbsp;
                  {item.endDate ? <>{item.endDate}</> : <>present</>}
                </span>
                <div
                  className="mt-4 md-remark"
                  dangerouslySetInnerHTML={{
                    __html: item.jobDescription.childMarkdownRemark.html,
                  }}
                />
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
            margin-top: 16px;
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
