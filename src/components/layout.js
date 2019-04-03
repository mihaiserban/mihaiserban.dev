import React from 'react'
import styled from 'styled-components'
import { ThemeProvider, Container, Box } from 'jonleopard-design-system'
import Footer from './footer'
import NavBar from './navbar'

const Hero = styled(Box)`
  min-height: 100vh;
`

const Layout = ({ children }) => (
  <>
    <ThemeProvider>
      <Hero width={1} p={3} bg="snow">
        <Container maxWidth={960} px={3}>
          <NavBar />
          {children}
          <Footer />
        </Container>
      </Hero>
    </ThemeProvider>
  </>
)

export default Layout
