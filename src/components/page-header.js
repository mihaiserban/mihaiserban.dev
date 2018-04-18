import React from 'react';
import { Box } from 'grid-styled';

import { H1, Text } from './typography';

const PageHeader = ({ title, subTitle }) => (
  <Box pt={[24, 48]} pb={[2, 4]}>
    <H1>{title}</H1>
    {subTitle ? <Text fontSize={[0, 1, 2]}>{subTitle}</Text> : null}
  </Box>
);
export default PageHeader;
