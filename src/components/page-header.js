import React from 'react';
import { Box, Text } from 'rebass';

const PageHeader = ({ title, subTitle }) => (
  <>
    <Text fontSize={[4, 5, 6]}>{title}</Text>
    {subTitle ? (
      <Text fontSize={[2, 2, 3]} pt={2}>
        {subTitle}
      </Text>
    ) : null}
  </>
);
export default PageHeader;
