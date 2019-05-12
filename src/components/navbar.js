/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React from 'react'
import Baffle from 'baffle-react'
import { Flex, Box, Text } from 'rebass'
import { Sun, Moon } from 'react-feather'
import Link from './link'
import { useAppContext } from './layout'

const NavBar = () => {
  const state = useAppContext()

  return (
    <Text fontSize={2} fontFamily="body">
      <Box width={1}>
        <Flex alignItems="center" py={3}>
          <Box>
            <Link to="/">
              <Baffle obfuscate={false} speed={30} revealDelay={0} characters="10">
                jonleopard.com ▌
              </Baffle>
            </Link>
          </Box>
          <Box mx="auto" />
          <Box pr={2}>
            <Link to="/profile">profile</Link>
          </Box>
          <Box pr={2}>
            <Link to="/blog">blog</Link>
          </Box>
          <Box ml={2}>
            <Text
              title="Toggle Color Mode"
              onClick={e => {
                e.preventDefault()
                state.cycleMode()
              }}
            >
              {state.mode === 'dark' ? <Sun size={28} /> : <Moon size={28} />}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Text>
  )
}

export default NavBar
