import React from 'react';
import { Box } from 'grid-styled';


const PageHeader = ({ title, subTitle }) => (
  <Box pt={[24, 48]} pb={[2, 4]}>
    <h1>{title}</h1>
    {subTitle ? <Text fontSize={[0, 1, 2]}>{subTitle}</Text> : null}
  </Box>
);
export default PageHeader;
