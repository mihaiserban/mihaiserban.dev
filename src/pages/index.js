import React from 'react';
import { Flex, Box, Text, Link } from 'rebass';

import SEO from '../components/seo';
import Layout from 'components/layout';

const Index = () => {
  return (
    <>
      <Layout>
        <SEO />
        <Box width={1} pt={[20, 80]}>
          <Text fontSize={[4, 5, 6]}>
            Hello, my name is Jon. <br /> I am a web developer based in Paris.
          </Text>
        </Box>
      </Layout>
    </>
  );
};

export default Index;
