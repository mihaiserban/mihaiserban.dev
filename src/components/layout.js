import React, { useState } from 'react'
import styled, { createGlobalStyle, ThemeProvider, css } from 'styled-components'
import { Flex, Box } from 'rebass'
import reset from 'styled-reset'
import { useTransition, animated } from 'react-spring'

import Footer from './footer'
import NavBar from './navbar'

const pink = '#ff88f4'
const purple = '#a771e7'
const black = '#000'
const lightgray = '#f6f6ff'

const theme = {
  fonts: {
    heading: 'Rubik',
    body: 'Lato',
  },
  lineHeights: {
    heading: 1.25,
    body: 1.667,
  },
  colors: {
    pink,
    purple,
    black,
    lightgray,
  },
  fontSizes: [12, 14, 18, 20, 24, 32, 48, 64, 72],
}

const GlobalStyle = createGlobalStyle`
 
  html {
    background-color: ${props => props.theme.colors.lightgray};
    margin: 0;
    border: 0;
    }

  body {
    border: 0;
    margin: 0;
    padding: 0;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  
  a {
    text-decoration: none;
    color: ${props => props.theme.colors.purple};
  }
  ${reset}
}`

const Wrapper = styled(Box)`
  max-width: 560px;
  margin: 0 auto;
  padding-left: 19px;
  padding-right: 19px;
`

const Layout = ({ children }) => {
  const [toggle, set] = useState(false)
  const transitions = useTransition(toggle, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return transitions.map(({ item, props, key }) => (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <>
          <Flex
            flexDirection="column"
            css={css`
              min-height: 100vh;
            `}
          >
            <NavBar />
            <GlobalStyle />
            <Box
              css={css`
                flex-grow: 1;
              `}
            >
              <animated.div key={key} style={props}>
                {children}
              </animated.div>
            </Box>
            <Footer />
          </Flex>
        </>
      </Wrapper>
    </ThemeProvider>
  ))
}

export default Layout
