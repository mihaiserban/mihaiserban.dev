import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1, H2 } from '../components/text/headings';

const startCareer = new Date('2010-05-01');

function diffYears(dt1, dt2) {
  return dt2.getFullYear() - dt1.getFullYear();
}

const Page = ({ data }) => {
  const { nodes: technologies } = data.allContentfulTechnologies;
  const { platforms } = data.contentfulAbout;

  const carrerSpan = diffYears(startCareer, new Date());

  return (
    <Layout>
      <div>
        <H1>About me</H1>
        <div className="flex-parent flex-parent--column flex-parent--wrap mt16">
          <p>Hi! I’m Mihai, a Software Engineer from Cluj-Napoca, Romania.</p>
          <p>
            I've been practicing my craft for the last&nbsp;
            <bold>{carrerSpan} years</bold>.
          </p>
          <p>In my free time I enjoy practicing my latte art and catching Pokemon of course!</p>
        </div>
        <H2 className="mt16">Platforms</H2>
        <div className="tags flex-parent flex-parent--row flex-parent--wrap mt16">
          {platforms.map(({ title }) => (
            <span className="tag fw2 f6">{title}</span>
          ))}
        </div>
        <H2 className="mt16">Technologies</H2>
        <div className="flex-parent flex-parent--row flex-parent--wrap mt16">
          {technologies.map(tech => (
            <div className="flex-parent flex-parent--column flex-parent--center-cross imageContainer">
              <img src={tech.image.file.url} alt={tech.title} className="image" />
              <span className="text mt16">{tech.title}</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>
        {`
          .imageContainer {
            width: 100px;
            height: auto;
            margin-top: 16px;
            margin-bottom: 16px;
            margin-left: -25px;
          }
          .image {
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
    }
    allContentfulTechnologies(sort: { fields: [createdAt], order: DESC }) {
      nodes {
        id
        title
        image {
          file {
            url
            fileName
            contentType
          }
        }
      }
    }
  }
`;
