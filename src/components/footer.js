import React from 'react';
import { Flex, Box, Link, Text } from 'rebass';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => (
  <Flex as="footer" justifyContent="center" py={40}>
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
        href="https://t.me/hiJon"
        itemProp="sameAs"
      >
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
    <Box>
      <Link
        color="black"
        target="_blank"
        rel="noopener noreferrer"
        href="http://github.com/jonleopard/jonleopard.com"
      >
        view source
      </Link>
    </Box>
  </Flex>
);

export default Footer;
