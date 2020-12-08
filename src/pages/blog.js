import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";

const BlogIndex = ({ data }) => {
  console.log(data);
  const { edges: blogs } = data.allContentfulBlogPost;

  return (
    <Layout>
      <div>
        <h1>Blog</h1>
        <div className="flex flex-col mt-8">
          {blogs.map(({ node: blog }, index) => {
            if (blogs.hidden && blogs.hidden === true) return null;
            return (
              <div className="flex flex-col mb-8" key={blog.id}>
                <div className="flex flex-row projectContainer">
                  <div className="flex flex-col">
                    <p className="text-sm text-secondary-color min-w-32">
                      {blog.date}
                    </p>
                    <Link to={`/blog/${blog.slug}`} className="blogLink mt-1">
                      <h4 className="text-lg md:text-xl font-medium mb-2 w-full text-gray-900 dark:text-gray-100">
                        {blog.title}
                      </h4>
                    </Link>

                    {blog.tags && (
                      <div className="tags flex flex-row flex-wrap mt-2">
                        {blog.tags.map(({ tag }) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {blog.body.childMarkdownRemark.excerpt}
                    </p>
                  </div>
                </div>
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
          :global(.blogLink) {
            color: var(--primary-color);
          }
          :global(.blogLink:hover) {
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

export default BlogIndex;

export const pageQuery = graphql`
  query BlogsIndexQuery {
    allContentfulBlogPost(sort: { fields: [date], order: DESC }) {
      edges {
        node {
          date(formatString: "DD MMMM YYYY")
          title
          slug
          id
          hidden
          body {
            childMarkdownRemark {
              html
              timeToRead
              excerpt(pruneLength: 200)
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
        }
      }
    }
  }
`;
