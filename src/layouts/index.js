import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Footer from 'components/footer';
import Header from 'components/header';
import GlobalStyles from 'components/global-styles';

const theme = {
  fontWeight: [300, 400, 500, 600],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64, 72],
  colors: {
    background: '#F5F5F5',
    heading: '#000000',
    text: '#000000',
    textHover: '#F59AF0',
    border: '#e6e9ef',
    link: '#000000',
    primary: '#F59AF0',
  },
};

const Inner = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
`;

export default props => (
  <ThemeProvider theme={theme}>
    <GlobalStyles>
      <Inner>
        <Header />
        {props.children()}
        <Footer />
      </Inner>
    </GlobalStyles>
  </ThemeProvider>
);
