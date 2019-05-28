import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import Img from 'gatsby-image';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1, H3 } from '../components/text/headings';

const BlogIndex = ({ data }) => {
  const { edges: projects } = data.allContentfulProject;

  return (
    <Layout>
      <div>
        <H1>Projects</H1>
        <div className="flex-parent flex-parent--column mt32">
          {projects.map(({ node: project }, index) => {
            if (project.hidden && project.hidden === true) return null;
            return (
              <div className="flex-parent flex-parent--column" key={project.id}>
                <div className="flex-parent flex-parent--row projectContainer">
                  {project.previewImage &&
                    project.previewImage.file.contentType.indexOf('image') !== -1 && (
                      <Link as={glink} to={`/project/${project.slug}`}>
                        <Img
                          className="imageProjects mr24"
                          fixed={project.previewImage.fixed}
                          alt={project.previewImage.title}
                          imgStyle={{
                            objectFit: 'contain',
                          }}
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
                    {project.technologies !== null && (
                      <div className="tags flex-parent flex-parent--row flex-parent--wrap mt8">
                        {project.technologies.map(({ title }) => (
                          <span className="tag fw2 f6" key={title}>
                            {title}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.context && (
                      <p className="mt8">{project.context.childMarkdownRemark.excerpt}</p>
                    )}
                  </div>
                </div>
                {index < projects.length - 1 && <div className="divider mb32 mt32" />}
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
          .tag {
            padding-top: 3px;
            padding-bottom: 3px;
            padding-left: 8px;
            padding-right: 8px;
            border: 1px solid var(--separator-color);
            border-radius: 15px;
            margin: 4px;
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
          }
          technologies {
            title
          }
        }
      }
    }
  }
`;
