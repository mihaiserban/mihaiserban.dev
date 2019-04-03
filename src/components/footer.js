import React from 'react'
import { Flex, Box, Link, Text } from 'jonleopard-design-system'

const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => (
  <Flex alignItems="right" justifyContent="center" py={40}>
    <Box width={1 / 3}>
      <Text>&copy; {CURRENT_YEAR}</Text>
    </Box>
    <Box mx="auto" />

    <Box pr={2}>
      <Link
        color="black"
        target="_blank"
        rel="noopener noreferrer me"
        href="https://twitter.com/jonlprd"
        itemProp="sameAs"
      >
        Twitter
      </Link>
    </Box>
    <Box pr={2}>
      <Link
        color="black"
        target="_blank"
        rel="noopener noreferrer me"
        href="http://github.com/jonleopard"
        itemProp="sameAs"
      >
        GitHub
      </Link>
    </Box>
    <Box>
      <Link
        color="black"
        target="_blank"
        rel="noopener noreferrer"
        href="http://github.com/jonleopard/jonleopard.com"
      >
        View Source
      </Link>
    </Box>
  </Flex>
)

export default Footer
