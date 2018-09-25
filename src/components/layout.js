import React, { Fragment } from 'react';
import Footer from 'components/footer';
import NavBar from 'components/navbar';
import styled from 'styled-components';
import { ThemeProvider, Container, Box } from 'jonleopard-design-system';

const Hero = styled(Box)`
  min-height: 100vh;
`;

const Layout = ({ children }) => (
  <React.Fragment>
    <ThemeProvider>
      <Hero width={1} p={3} bg="snow">
        <Container maxWidth={960} px={3}>
          <NavBar />
          {children}
          <Footer />
        </Container>
      </Hero>
    </ThemeProvider>
  </React.Fragment>
);

export default Layout;
