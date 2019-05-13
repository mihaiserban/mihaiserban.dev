/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useLayoutEffect, useContext } from 'react'
import styled, { createGlobalStyle, ThemeProvider, css } from 'styled-components'
import { Flex, Box } from 'rebass'
import { normalize } from 'styled-normalize'
import { merge, get } from 'lodash'
import { useTransition, animated } from 'react-spring'

// Fonts
import Rubik from 'typeface-rubik'
import Lato from 'typeface-lato'

// Components
import theme from './theme'
import SEO from './SEO'
import Footer from './footer'
import NavBar from './navbar'

const GlobalStyle = createGlobalStyle`  
  body {
    transition-property: background-color, color;
    transition-duration: .2s;
    transition-timingFunction: ease-out;
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    border: 0;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  
  a, a:visited {
    text-decoration: none;
    color: ${props => props.theme.colors.primary}; 

  ${normalize}
}`

// Create some context for other components
export const Context = React.createContext()
export const useAppContext = () => useContext(Context)

// Color modes
const modes = ['light', 'dark']

const getTheme = mode =>
  merge({}, theme, {
    colors: get(theme.colors.modes, mode, theme.colors),
  })

const Wrapper = styled(Box)`
  max-width: 560px;
  margin: 0 auto;
  padding-left: 19px;
  padding-right: 19px;
`

const Layout = ({ children, location }) => {
  // Color mode hook
  const [mode, setMode] = useState(modes[0])

  const theme = getTheme(mode)
  if (location) {
    theme.colors = merge({}, theme.colors, colors)
  }

  useLayoutEffect(() => {
    const initialMode = window.localStorage.getItem('mode') || modes[0]
    if (initialMode && initialMode !== mode) {
      setMode(initialMode)
    }
  }, [])

  useLayoutEffect(() => {
    window.localStorage.setItem('mode', mode)
  }, [mode])

  const cycleMode = () => {
    const i = (modes.indexOf(mode) + 1) % modes.length
    setMode(modes[i])
  }

  const context = {
    modes,
    mode,
    setMode,
    cycleMode,
  }

  // Page transition hook
  const [toggle, set] = useState(false)
  const transitions = useTransition(toggle, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <>
      <SEO />
      <Context.Provider value={context}>
        <ThemeProvider theme={theme}>
          <Wrapper>
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
                {transitions.map(({ item, key, props }) => (
                  <animated.div key={key} style={props}>
                    {children}
                  </animated.div>
                ))}
              </Box>
              <Footer />
            </Flex>
          </Wrapper>
        </ThemeProvider>
      </Context.Provider>
    </>
  )
}

export default Layout
