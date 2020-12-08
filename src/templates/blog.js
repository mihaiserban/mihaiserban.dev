import React, { useState } from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Layout from "../components/layout";
import SEO from "../components/SEO";
import Tag from "../components/tag";
import Link from "../components/link";
import { readingTime } from "../utils/utils";

import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

const Blog = ({ data }) => {
  if (!data) return null;

  console.log(data);
  const blog = data.contentfulBlogPost;
  const about = data.contentfulAbout;

  return (
    <Layout>
      <SEO />
      <article>
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          {blog.title}
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mt-2 mb-8">
          <div className="flex items-center">
            <Img
              fixed={about.image.fixed}
              className="headshot rounded-full"
              alt="Headshot Mihai Serban"
              style={{ width: "24px", height: "24px" }}
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Serban Mihai / {blog.date}
            </p>
          </div>
          <p className="text-sm text-secondary-color min-w-32 mt-2 md:mt-0">
            ~{blog.body.childMarkdownRemark.timeToRead} min read
          </p>
        </div>
        <div
          className="md-remark mt-8"
          dangerouslySetInnerHTML={{
            __html: blog.body.childMarkdownRemark.html,
          }}
        />
      </article>
    </Layout>
  );
};

export default Blog;

export const pageQuery = graphql`
  query BlogQuery($slug: String!) {
    contentfulAbout {
      image {
        fixed(width: 200, quality: 200) {
          base64
          width
          height
          src
          srcSet
          srcWebp
          srcSetWebp
        }
      }
      location
    }
    contentfulBlogPost(slug: { eq: $slug }) {
      id
      slug
      title
      date(formatString: "DD MMMM YYYY")
      body {
        childMarkdownRemark {
          html
          timeToRead
          excerpt
        }
      }
    }
  }
`;
