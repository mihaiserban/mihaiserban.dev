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
          <Heading fontSize={6} pb={3}>
            Greetings Program.
          </Heading>
        </Flex>
      </Box>
      <Box mt={6}>
        <Flex flexDirection="column">
          <Text fontSize={[2, 2, 3]}>My name is Jon Leopard 👋🏼</Text>
          <Text fontSize={[2, 2, 3]}>I'm a web developer based in Paris 🇫🇷</Text>
        </Flex>
      </Box>
    </Layout>
  </>
)

export default Index
