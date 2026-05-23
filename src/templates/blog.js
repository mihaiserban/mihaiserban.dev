import React, { useState } from "react";
import { graphql } from "gatsby";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Layout from "../components/layout";
import SEO from "../components/SEO";
import Tag from "../components/tag";
import Link from "../components/link";

import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

const Blog = ({ data }) => {
  if (!data) return null;

  const blog = data.markdownRemark;
  const about = data.dataJson;

  return (
    <Layout>
      <SEO title={blog.frontmatter.title} description={blog.frontmatter.description} />
      <article>
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          {blog.frontmatter.title}
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mt-2 mb-8">
          <div className="flex items-center">
            <img
              src={about.image.publicURL}
              className="headshot rounded-full"
              alt="Headshot Mihai Serban"
              style={{ width: "24px", height: "24px" }}
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Serban Mihai / {blog.frontmatter.date}
            </p>
          </div>
          <p className="text-sm text-secondary-color min-w-32 mt-2 md:mt-0">
            ~{blog.timeToRead} min read
          </p>
        </div>
        <div
          className="md-remark mt-8"
          dangerouslySetInnerHTML={{
            __html: blog.html,
          }}
        />
      </article>
    </Layout>
  );
};

export default Blog;

export const pageQuery = graphql`
  query BlogQuery($slug: String!) {
  dataJson {
    image {
      publicURL
    }
    location
  }
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      id
      frontmatter {
        slug
        title
        description
        date(formatString: "DD MMMM YYYY")
      }
      html
      timeToRead
      excerpt
    }
  }
`;
