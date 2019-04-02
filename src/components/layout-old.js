import React, { Fragment } from 'react';
import Footer from 'components/footer';
import NavBar from 'components/navbar';
import styled from 'styled-components';
import { Container, Box } from 'rebass';

const Hero = styled(Box)`
  min-height: 100vh;
  {children}
`;

const Layout = ({ children }) => (
  <>
    <Hero width={1} p={3} bg="snow">
      <Container maxWidth={960} px={3}>
        <NavBar />
        {children}
        <Footer />
      </Container>
    </Hero>
  </>
);

export default Layout;
