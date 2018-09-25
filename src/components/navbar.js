import React from 'react';
import styled from 'styled-components';
import { Link as GLink } from 'gatsby';
import { Flex, Box, Link, Text } from 'jonleopard-design-system';

const NavBar = () => (
  <Flex alignItems="center" justifyContent="center" py={3}>
    <Box width={1 / 3}>
      <Link as={GLink} to="/">
        jonleopard.com
      </Link>
    </Box>
    <Box mx="auto" />
    <Box pr={2}>
      <Link to="/profile" color="primary">
        Profile
      </Link>
    </Box>
    <Box pr={2}>
      <Link
        color="primary"
        href="https://github.com/jonleopard"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </Link>
    </Box>
    <Box>
      <Link
        color="primary"
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
