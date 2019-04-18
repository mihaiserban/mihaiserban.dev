import React from 'react';
import { Flex, Box, Text, Heading } from 'rebass';
import { css } from 'styled-components';

import SEO from '../components/seo';
import Layout from 'components/layout';

const Index = () => {
  return (
    <>
      <Layout>
        <SEO />
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Box width={1} pt={[20, 80]}>
            <Heading fontSize={[4, 5, 6]} pb={3}>
              Greetings Program.
            </Heading>
            <Text fontSize={[2, 2, 3]}>My name is Jon Leopard 👋🏼</Text>
            <Text fontSize={[2, 2, 3]}>
              I'm a web developer based in Paris 🇫🇷
            </Text>
          </Box>
        </Flex>
      </Layout>
    </>
  );
};

export default Index;
