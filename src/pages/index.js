import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';
import Img from 'gatsby-image';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1, H2 } from '../components/text/headings';

import Markdown from '../components/markdown';

const startCareer = new Date('2010-05-01');

function diffYears(dt1, dt2) {
  return dt2.getFullYear() - dt1.getFullYear();
}

const Page = ({ data }) => {
  const { nodes: technologies } = data.allContentfulTechnologies;
  const { platforms, body, education, experience } = data.contentfulAbout;

  const sortedExperience = experience.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  return (
    <Layout>
      <div>
        <H1>About me</H1>
        <Markdown
          className="mt16"
          dangerouslySetInnerHTML={{
            __html: body.childMarkdownRemark.html,
          }}
        />
        <div className="flex-parent flex-parent--column mt16">
          <H2>Education</H2>
          <div className="flex-parent flex-parent--column">
            {education.map(item => (
              <>
                <span className="mt8">{item.title}</span>
                <span className="fw2 f6 mt4">
                  {item.startDate} -
{item.endDate}
                </span>
              </>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt16">
          <H2>Platforms</H2>
          <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
            {platforms.map(({ title }) => (
              <span className="tag fw2 f6">{title}</span>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt16">
          <H2>Technologies</H2>
          <div className="flex-parent flex-parent--row flex-parent--wrap mt8">
            {technologies.map(tech => (
              <div className="flex-parent flex-parent--column flex-parent--center-cross imageContainer">
                <Img fluid={tech.image.fluid} alt={tech.title} className="imageTech" />
                <span className="text mt16">{tech.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-parent flex-parent--column mt16">
          <H2>Experience</H2>
          <div className="flex-parent flex-parent--column">
            {sortedExperience.map(item => (
              <>
                <span className="mt16">{item.company}</span>
                <span className="fw2 f6 mt4">
                  {item.startDate} -
{item.endDate}
                  <div
                    className="mt16"
                    dangerouslySetInnerHTML={{
                      __html: item.jobDescription.childMarkdownRemark.html,
                    }}
                  />
                </span>
              </>
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
            margin-left: -35px;
          }
          :global(.imageTech) {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border: 1px solid #e6e6e6;
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
