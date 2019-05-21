import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Twitter, Facebook, HackerNews, Reddit } from 'react-social-sharing';
import { Flex, Box, Text } from 'rebass';

// Hard coded color: 'white' to resist color mode inheritance

const SocialMediaButtons = () => {
  const data = useStaticQuery(graphql`
    query SocialButtonQuery {
      contentfulBlogPost {
        title
        slug
      }
      contentfulSite {
        siteUrl
        userTwitter
      }
    }
  `);
  return (
    <>
      <Box my={3}>
        <Box mt={4}>
          <Text fontFamily="body" fontSize={2}>
            Share this post ❤️
          </Text>
        </Box>
        <Box ml={-2} mt={2}>
          <Flex justifyContent="space-between" flexWrap="wrap">
            <Twitter
              style={{ color: 'white' }}
              message={`${data.contentfulBlogPost.title} by ${data.contentfulSite.userTwitter}`}
              link={`${data.contentfulSite.siteUrl}/blog/${data.contentfulBlogPost.slug}`}
            />
            <Reddit
              style={{ color: 'white' }}
              link={`${data.contentfulSite.siteUrl}/blog/${data.contentfulBlogPost.slug}`}
            />
            <Facebook
              style={{ color: 'white' }}
              link={`${data.contentfulSite.siteUrl}/blog/${data.contentfulBlogPost.slug}`}
            />
            <HackerNews
              style={{ color: 'white' }}
              link={`${data.contentfulSite.siteUrl}/blog/${data.contentfulBlogPost.slug}`}
            />
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default SocialMediaButtons;
