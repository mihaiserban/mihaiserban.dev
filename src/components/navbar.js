import React from 'react';
import styled from 'styled-components';
import { Link as GLink } from 'gatsby';
import { Flex, Box, Link, Text } from 'jonleopard-design-system';

const NavBar = () => (
  <Flex alignItems="center" justifyContent="center" py={3}>
    <Box width={1 / 3}>
      <Link as={GLink} color="black" to="/">
        jonleopard.com ▌
      </Link>
    </Box>
    <Box mx="auto" />
    <Box pr={2}>
      <Link as={GLink} to="/profile" color="black">
        Profile
      </Link>
    </Box>
    <Box pr={2}>
      <Link
        color="black"
        href="https://github.com/jonleopard"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </Link>
    </Box>
    <Box>
      <Link
        color="black"
        href="https://twitter.com/jonlprd"
        target="_blank"
        rel="noopener noreferrer"
      >
        Twitter
      </Link>
    </Box>
  </Flex>
);

export default NavBar;
