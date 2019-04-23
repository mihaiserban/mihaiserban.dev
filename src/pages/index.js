import React from 'react'
import { Flex, Box, Text, Heading } from 'rebass'

import SEO from '../components/SEO'
import Layout from '../components/layout'

const Index = () => (
  <>
    <Layout>
      <SEO />
      <Box width={1} mt={[40, 80]}>
        <Flex flexDirection="column">
          <Heading fontFamily="sourceSans" fontSize={6} pb={3}>
            You've reached the personal blog of Jon Leopard
          </Heading>
        </Flex>
      </Box>
      <Box>
        <Flex flexDirection="column">
          <Text fontFamily="sourceSans" fontSize={4}>
            a web developer based in Paris 🇫🇷
          </Text>
        </Flex>
      </Box>
    </Layout>
  </>
)

export default Index
