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

  console.log(data);
  const blog = data.contentfulBlogPost;

  return (
    <Layout>
      <SEO />
      <article>
        <h1 className="mt-12">{blog.title}</h1>
        <p className="mt-2">{blog.date}</p>
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
