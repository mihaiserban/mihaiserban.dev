import React from 'react'
import { graphql } from 'gatsby'
import { Box, Text } from 'rebass'

import Markdown from '../components/markdown'
import Layout from '../components/layout'
import SEO from '../components/SEO'
import PageHeader from '../components/page-header'
import SocialMediaButtons from '../components/social-media-buttons'

const Template = ({ data }) => {
  if (!data) return null
  return (
    <Layout>
      <SEO />
      <article>
        <>
          <Box width={1} pt={[20, 80]} pb={2}>
            <Text size="10px">Written on {data.contentfulBlogPost.date}</Text>
            <Text fontFamily="heading" lineHeight="heading">
              <PageHeader title={data.contentfulBlogPost.title} />
            </Text>
          </Box>

          <SocialMediaButtons />
          <Markdown
            dangerouslySetInnerHTML={{
              __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
            }}
            id="top"
            className="content"
          />
        </>
      </article>
      <SocialMediaButtons />
    </Layout>
  )
}

export default Template

export const pageQuery = graphql`
  query BlogPostQuery($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      id
      slug
      date(formatString: "DD MMMM YYYY")
      body {
        childMarkdownRemark {
          html
          excerpt
        }
      }
    }
  }
`
