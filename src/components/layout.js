import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Box } from 'rebass';
import reset from 'styled-reset';

import SEO from './seo';
import Footer from 'components/footer';
import NavBar from 'components/navbar';

const blue = '#07c';
const lightgray = '#f6f6ff';

const theme = {
  colors: {
    blue,
    lightgray,
  },
  buttons: {
    primary: {
      color: '#fff',
      backgroundColor: blue,
    },
    outline: {
      color: blue,
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 2px',
    },
  },
};

const GlobalStyle = createGlobalStyle`
  ${reset}

   html {
      font-family: "Open-Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
  
    body {
      background-color: ${props => props.theme.colors.lightgray};
      margin: 0;

    a {
      text-decoration: none;
    }
}`;

const Wrapper = styled(Box)`
  max-width: 560px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
`;

const Layout = ({ children }) => (
  <ThemeProvider theme={theme}>
    <Wrapper>
      <NavBar />
      <SEO />
      <GlobalStyle />
      {children}
      <Footer />
    </Wrapper>
  </ThemeProvider>
);

export default Layout;
