import React from 'react'
import { Heading, Text } from 'rebass'

const PageHeader = ({ title, subTitle }) => (
  <>
    <Heading fontSize={6}>{title}</Heading>
    {subTitle ? (
      <Text fontSize={3} pt={2}>
        {subTitle}
      </Text>
    ) : null}
  </>
)
export default PageHeader
