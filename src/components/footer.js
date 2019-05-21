import React from 'react';
import { Flex, Box, Text } from 'rebass';

import Link from './link';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => (
  <Text fontSize={[1, 2]} fontFamily="body">
    <Flex as="footer" py={40}>
      <Box>
        <Text>
          &copy;
          {CURRENT_YEAR}
        </Text>
      </Box>
      <Box mx="auto" />
      <Box pr={2}>
        <Link
          target="_blank"
          rel="noopener noreferrer me"
          href="https://github.com/mihaiserban"
          itemProp="sameAs"
        >
          github
        </Link>
      </Box>
      <Box pr={2}>
        <Link
          target="_blank"
          rel="noopener noreferrer me"
          href="https://twitter.com/MihaiSerban"
          itemProp="sameAs"
        >
          twitter
        </Link>
      </Box>
      <Box pr={2}>
        <Link
          target="_blank"
          rel="noopener noreferrer me"
          href="https://stackoverflow.com/users/2259635/mihai-serban"
          itemProp="sameAs"
        >
          stack overflow
        </Link>
      </Box>
    </Flex>
  </Text>
);

export default Footer;
