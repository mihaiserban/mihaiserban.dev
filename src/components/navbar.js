import React from "react";
import styled from "styled-components";
import { Link as GLink } from "gatsby";
import { Flex, Box, Link } from "jonleopard-design-system";

const Glink = styled(Link);

const NavBar = () => (
  <Flex alignItems="center" justifyContent="center" py={3}>
    <Box width={1 / 3}>
      <Link href="/">jonleopard.com</Link>
    </Box>
    <Box mx="auto" />
    <Box pr={2}>
      <Link>
      <GLink to="/profile">Profile</GLink>
    </Link>
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
