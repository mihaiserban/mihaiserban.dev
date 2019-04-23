import React from 'react'
import Baffle from 'baffle-react'
import { Link as GLink } from 'gatsby'
import { Flex, Box, Link, Text } from 'rebass'

const NavBar = () => (
  <Text fontFamily="sourceSans">
    <Box width={1}>
      <Flex alignItems="center" py={3}>
        <Box>
          <Link as={GLink} color="black" to="/">
            <Text as={Baffle} obfuscate={false} speed={50} revealDelay={0} characters="10">
              jonleopard.com ▌
            </Text>
          </Link>
        </Box>
        <Box mx="auto" />
        <Box pr={2}>
          <Link as={GLink} to="/profile" color="black">
            profile
          </Link>
        </Box>
        <Box pr={2}>
          <Link as={GLink} to="/blog" color="black">
            blog
          </Link>
        </Box>
        <Box pr={2}>
          <Link as={GLink} to="/blog" color="black">
            photos
          </Link>
        </Box>
      </Flex>
    </Box>
  </Text>
)

export default NavBar
