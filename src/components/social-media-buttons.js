import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Twitter, Facebook, HackerNews, Reddit } from 'react-social-sharing'
import { Flex, Box, Text } from 'rebass'

import config from '../../config/website'

const SocialMediaButtons = () => {
  const data = useStaticQuery(graphql`
    query SocialButtonQuery {
      contentfulBlogPost {
        title
        slug
      }
    }
  `)
  return (
    <>
      <Box my={3}>
        <Box mt={4}>
          <Text fontFamily="body" fontSize={2}>
            Share this post ❤️
          </Text>
        </Box>
        <Box ml={-2} mt={2}>
          <Flex justifyContent="space-between">
            <Twitter
              message={`${data.contentfulBlogPost.title} by ${config.userTwitter}`}
              link={`${config.siteUrl}/blog/${data.contentfulBlogPost.slug}`}
            />
            <Reddit link={`${config.siteUrl}/blog/${data.contentfulBlogPost.slug}`} />
            <Facebook link={`${config.siteUrl}/blog/${data.contentfulBlogPost.slug}`} />
            <HackerNews link={`${config.siteUrl}/blog/${data.contentfulBlogPost.slug}`} />
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default SocialMediaButtons
