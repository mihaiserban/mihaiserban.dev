import React from 'react';
import styled from 'styled-components';
import Baffle from 'baffle-react';
import { Link as GLink } from 'gatsby';
import { Flex, Box, Link, Text } from 'jonleopard-design-system';

const animatedBox = styled.div`
  display: inline-block;
  width: 10px;
  height: 1rem;
  background: #fe5186;
  margin-left: 5px;
  border-radius: 1px;
  -webkit-animation: cursor 1s infinite;
  animation: cursor 1s infinite;
`;

const NavBar = () => (
  <Box with={1}>
    <Flex alignItems="center" justifyContent="center" py={3}>
      <Box>
        <Link as={GLink} color="black" to="/">
          <Text
            as={Baffle}
            obfuscate={false}
            speed={50}
            revealDelay={0}
            characters="10"
          >
            jonleopard.com ▌
          </Text>
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
  </Box>
);

export default NavBar;
