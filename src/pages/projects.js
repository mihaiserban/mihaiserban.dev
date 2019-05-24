import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1, H3 } from '../components/text/headings';

const BlogIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <H1>Projects</H1>
      <div className="flex-parent flex-parent--column mt32">
        {projects.map(({ node: project }, index) => (
          <div className="flex-parent flex-parent--column">
            <div className="flex-parent flex-parent--row">
              {project.previewImage &&
                project.previewImage.file.contentType.indexOf('image') !== -1 && (
                  <Link as={glink} to={`/project/${project.slug}`}>
                    <img
                      className="image mr24"
                      src={project.previewImage.file.url}
                      alt={project.previewImage.title}
                    />
                  </Link>
                )}
              <div className="flex-parent flex-parent--column">
                <Link as={glink} to={`/project/${project.slug}`} className="projectLink">
                  <H3>{project.title}</H3>
                </Link>
                <span className="fw2 f6 mt4">
                  {project.startDate} -
{project.endDate}
                </span>
                <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
                  {project.technologies.map(({ title }) => (
                    <span className="tag fw2 f6">{title}</span>
                  ))}
                </div>
                <p className="mt8">{project.body.childMarkdownRemark.excerpt}</p>
              </div>
            </div>
            {index < projects.length - 1 && <div className="divider mb32 mt32" />}
          </div>
        ))}
      </div>
      <style jsx>
        {`
          .image {
            width: 200px;
            height: 200px;
            object-fit: contain;
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
          .divider {
            width: 100%;
            height: 1px;
            background: #e6e6e6;
          }
          :global(.projectLink) {
            color: #222;
          }
          :global(.projectLink:hover) {
            color: #2195ff;
          }
        `}
      </style>
    </Layout>
  );
};

export default BlogIndex;

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
          body {
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
        }
      }
    }
  }
`;
