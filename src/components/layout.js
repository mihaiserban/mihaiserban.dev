import React from "react";
import styled, { ThemeProvider } from "styled-components";
import Footer from "components/footer";
import Header from "components/header";
import GlobalStyles from "components/global-styles";

import theme from './theme'

const Inner = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Layout = ({ children }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyles>
      <Inner>
        <Header />
        {children}
        <Footer />
      </Inner>
    </GlobalStyles>
  </ThemeProvider>
);

export default Layout;
