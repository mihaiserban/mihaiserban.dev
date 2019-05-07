import React from 'react'
import { Flex, Box, Link, Text } from 'rebass'

const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => (
  <Text fontSize={[1, 2]} fontFamily="body">
    <Flex as="footer" py={40}>
      <Box>
        <Text>&copy; {CURRENT_YEAR}</Text>
      </Box>
      <Box mx="auto" />
      <Box pr={2}>
        <Link
          color="black"
          target="_blank"
          rel="noopener noreferrer me"
          href="https://github.com/jonleopard"
          itemProp="sameAs"
        >
          github
        </Link>
      </Box>
      <Box pr={2}>
        <Link
          color="black"
          target="_blank"
          rel="noopener noreferrer me"
          href="https://twitter.com/jonlprd"
          itemProp="sameAs"
        >
          twitter
        </Link>
      </Box>

      <Box pr={2}>
        <Link
          color="black"
          target="_blank"
          rel="noopener noreferrer me"
          href="https://stackoverflow.com/users/10541736/jon-leopard"
          itemProp="sameAs"
        >
          stack overflow
        </Link>
      </Box>
      <Box pr={2}>
        <Link color="black" target="_blank" rel="noopener noreferrer me" href="https://t.me/hiJon" itemProp="sameAs">
          telegram
        </Link>
      </Box>
      <Box pr={2}>
        <Link
          color="black"
          target="_blank"
          rel="noopener noreferrer me"
          href="https://keybase.io/jonleopard/pgp_keys.asc"
          itemProp="sameAs"
        >
          gpg
        </Link>
      </Box>
    </Flex>
  </Text>
)

export default Footer
