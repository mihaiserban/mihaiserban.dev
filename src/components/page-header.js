import React from 'react'
import { Box, Heading, Text } from 'rebass'

const PageHeader = ({ title, subTitle }) => (
  <Box width={1}>
    <Heading fontSize={6}>{title}</Heading>
    {subTitle ? (
      <Text fontSize={3} pt={2}>
        {subTitle}
      </Text>
    ) : null}
  </Box>
)
export default PageHeader
