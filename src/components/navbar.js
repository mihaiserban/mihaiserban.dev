import React from "react";
import styled from "styled-components";
import { Link as GatsbyLink } from "gatsby";
import { Flex, Box, Link, Text } from "jonleopard-design-system";


const NavBar = () => (
  <Flex alignItems="center" justifyContent="center" py={3}>
    <Box width={1 / 3}>
      <GatsbyLink to="/">jonleopard.com</GatsbyLink>
    </Box>
    <Box mx="auto" />
    <Box pr={2}>
      <GatsbyLink as={Text} to="/profile">
        Profile
      </GatsbyLink>
    </Box>
    <Box pr={2}>
      <Link
        href="https://github.com/jonleopard"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </Link>
    </Box>
    <Box>
      <Link
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
