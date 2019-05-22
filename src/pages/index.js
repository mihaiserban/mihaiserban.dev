import React from 'react';
import { Flex, Box, Text, Heading } from 'rebass';

import Layout from '../components/layout';

const Index = () => (
  <>
    <Layout>
      <Box width={1}>
        <Flex flexDirection="column">
          <Heading fontFamily="heading" fontSize={6} pb={3}>
            You've reached the personal blog of
            <br /> Mihai Serban
          </Heading>
        </Flex>
      </Box>
      <Box>
        <Flex flexDirection="column">
          <Text fontFamily="body" fontSize={4}>
            a web developer based in Paris 🇫🇷
          </Text>
        </Flex>
      </Box>
    </Layout>
    <style jsx>
      {`
        .test {
          background: red;
        }
      `}
    </style>
  </>
);

export default Index;
