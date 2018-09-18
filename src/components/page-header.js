import React from 'react';
import { Box } from 'grid-styled';

const PageHeader = ({ title, subTitle }) => (
  <Box pt={[24, 48]} pb={[2, 4]}>
    <h1>{title}</h1>
    {subTitle ? <h2 fontSize={[0, 1, 2]}>{subTitle}</h2> : null}
  </Box>
);
export default PageHeader;
