import React from 'react'
import { graphql } from 'gatsby'
import { Twitter, Facebook, HackerNews, Reddit } from 'react-social-sharing'
import { Flex, Box, Text } from 'rebass'

import Markdown from '../components/markdown'
import Layout from '../components/layout'
import SEO from '../components/SEO'
import PageHeader from '../components/page-header'

const Template = ({ data }) => {
  if (!data) return null
  return (
    <Layout>
      <SEO />
      <article>
        <>
          <Box width={1} pt={[20, 80]} pb={4}>
            <Text fontFamily="heading" lineHeight="heading">
              <PageHeader
                pb={4}
                title={data.contentfulBlogPost.title}
                subTitle={`Written on ${data.contentfulBlogPost.date}`}
              />
            </Text>
          </Box>
          <Markdown
            dangerouslySetInnerHTML={{
              __html: data.contentfulBlogPost.body.childMarkdownRemark.html,
            }}
            id="top"
            className="content"
          />
        </>
      </article>
      <Box mt={4}>
        <Text fontFamily="body" fontSize={2}>
          Share this post ❤️
        </Text>
      </Box>
      <Box ml={-2} mt={2}>
        <Flex justifyContent="space-between">
          <Twitter
            message={`${data.contentfulBlogPost.title} by @jonlprd |`}
            link={`https://jonleopard.com/${data.contentfulBlogPost.slug}`}
          />
          <Reddit link={`https://jonleopard.com/${data.contentfulBlogPost.slug}`} />
          <Facebook link={`https://jonleopard.com/${data.contentfulBlogPost.slug}`} />
          <HackerNews link={`https://jonleopard.com/${data.contentfulBlogPost.slug}`} />
        </Flex>
      </Box>
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
