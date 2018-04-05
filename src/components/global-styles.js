import styledNormalize from 'styled-normalize';
import styled, { injectGlobal } from 'styled-components';

// eslint-disable-next-line no-unused-expressions
injectGlobal`

  ${styledNormalize}

  ::selection {
    background-color: #A980E4;
    color: #fff;
  }
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  a {
    text-decoration: none;
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .content {
    a {
      border-bottom: 1px solid ${props => props.theme.colors.primary};
      &:visited {
        color: inherit;
      }
      &:active {
        background-color: ${props => props.theme.colors.primary};
        color: #fff;
      }
    }
  }
`;

export default styled.div`
  background-color: ${props => props.theme.colors.background};
  min-height: 100vh;
`;
