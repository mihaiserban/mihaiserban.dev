import React from 'react'
import { graphql } from 'gatsby'

import { Box } from 'rebass'

import Markdown from '../components/markdown'
import Layout from '../components/layout'
import SEO from '../components/SEO'
import PageHeader from '../components/page-header'

export default function Template({ data }) {
  if (!data) return null

  return (
    <Layout>
      <SEO />
      <article>
        <Box width={1} pt={[20, 80]} pb={4}>
          <PageHeader
            pb={4}
            title={data.contentfulBlogPost.title}
            subTitle={`Written on ${data.contentfulBlogPost.date}`}
          />
        </Box>
        <Markdown
          dangerouslySetInnerHTML={{
            __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
          }}
        />
      </article>
    </Layout>
  )
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      body {
        childMarkdownRemark {
          html
          excerpt
        }
      }
      date(formatString: "DD MMMM YYYY")
      id
      slug
    }
  }
`
