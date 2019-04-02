import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

import GlobalStyle from '../styles/global';
import SEO from './SEO';
import Footer from 'components/footer';
import NavBar from 'components/navbar';

import 'typeface-cantata-one';
import 'typeface-open-sans';

const Hero = styled(Box)`
  min-height: 100vh;
  {children}
`;

const Layout = ({ children }) => (
  <>
    <Hero width={1} p={3} bg="white">
      <NavBar />
      <SEO />
      <GlobalStyle />
      {children}
      <Footer />
    </Hero>
  </>
);
export default Layout;
