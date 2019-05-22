import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1, H2 } from '../components/text/headings';

const Page = ({ data }) => {
  const { nodes: technologies } = data.allContentfulTechnologies;

  return (
    <Layout>
      <H1 className="mt16">Technologies</H1>
      <div className="flex-parent flex-parent--row flex-parent--wrap mt16">
        {technologies.map(tech => (
          <div className="flex-parent flex-parent--column flex-parent--center-cross imageContainer">
            <img src={tech.image.file.url} alt={tech.title} className="image" />
            <span className="text mt16">{tech.title}</span>
          </div>
        ))}
      </div>
      <style jsx>
        {`
          .imageContainer {
            width: 130px;
            height: auto;
            margin-top: 16px;
            margin-bottom: 16px;
          }
          .image {
            width: 50px;
            height: 50px;
            object-fit: contain;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px 6px;
          }
          .text {
            font-size: 0.8rem;
            line-height: 1.3em;
            font-weight: 300;
            letter-spacing: 0.5px;
            opacity: 0.8;
            text-align: center;
          }
        `}
      </style>
    </Layout>
  );
};

export default Page;

export const pageQuery = graphql`
  query AboutPageQuery {
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
