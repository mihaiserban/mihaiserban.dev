/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState } from 'react'
import { Flex, Box, Text } from 'rebass'
import styled, { keyframes } from 'styled-components'
import { Sun, Moon } from 'react-feather'
import Link from './link'
import { useAppContext } from './layout'


const fade = keyframes`
  from {
    opacity: 0;

  to {
      opacity: 1;
    }
`

const AnimatedBlock = styled.div`
  display: inline-block;
  animation: ${fade} .5s alternate infinite;
  
`

const NavBar = () => {
  const state = useAppContext()
  return (
    <Text fontSize={2} fontFamily="body">
      <Box width={1}>
        <Flex alignItems="center" py={3}>
          <Box width={1}>
            <Link to="/">
            jonleopard.com
              <AnimatedBlock>
                ▌
              </AnimatedBlock>
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
