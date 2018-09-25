import React from 'react';
import { Box, Heading, Text } from 'jonleopard-design-system';

const PageHeader = ({ title, subTitle }) => (
  <Box pt={[24, 48]} pb={[2, 4]}>
    <Heading fontSize={[4, 5, 6]}>{title}</Heading>
    {subTitle ? (
      <Heading fontSize={[0, 1, 2]} color="muted">
        {subTitle}
      </Heading>
    ) : null}
  </Box>
);
export default PageHeader;
