import React from "react";
import { graphql } from "gatsby";

import Link from "../components/link";
import Layout from "../components/layout";
import Tag from "../components/tag";
import SEO from "../components/SEO";
import "../styles/scss/pages/index.scss";

const Index = ({ data }) => {
  const { edges: blogs } = data.allMarkdownRemark;

  return (
    <Layout>
      <SEO title="Blog - Mihai Serban" />
      <div>
        <h1>Blog</h1>
        <div className="flex flex-col mt-8">
          {blogs.map(({ node: blog }, index) => {
            if (blog.frontmatter.hidden && blog.frontmatter.hidden === true) return null;
            return (
              <div className="flex flex-col mb-8" key={blog.id}>
                <div className="flex flex-row projectContainer">
                  <div className="flex flex-col">
                    <p className="text-sm text-secondary-color min-w-32">
                      {blog.frontmatter.date}
                    </p>
                    <Link to={`/blog/${blog.frontmatter.slug}`} className="blogLink mt-1">
                      <h4 className="text-lg md:text-xl font-medium mb-2 w-full text-gray-900 dark:text-gray-100">
                        {blog.frontmatter.title}
                      </h4>
                    </Link>

                    {blog.frontmatter.tags != null && (
                      <div className="tags flex flex-row flex-wrap mt-2">
                        {blog.frontmatter.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {blog.frontmatter.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Index;

export const pageQuery = graphql`
  query BlogsIndexQuery {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/blog/" } }
      sort: { frontmatter: { date: DESC } }
    ) {
      edges {
        node {
          id
          frontmatter {
            date(formatString: "DD MMMM YYYY")
            title
            description
            slug
            hidden
            tags
          }
          html
          timeToRead
          excerpt(pruneLength: 200)
        }
      }
    }
  }
`;
