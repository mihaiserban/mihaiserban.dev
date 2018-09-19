import React, { Fragment } from "react";
import Footer from "components/footer";
import NavBar from "components/navbar";
import { ThemeProvider, Container, Box } from "jonleopard-design-system";

// const Inner = styled.div`
//   width: 100%;
//   max-width: 800px;
//   margin: 0 auto;
//   padding: 0 16px;
// `;

const Layout = ({ children }) => (
  <Fragment>
    <ThemeProvider>
      <Box width={[1, 1, 1, 1]} p={3} bg="snow">
        <Container px={3}>
          <NavBar />
          {children}
          <Footer />
        </Container>
      </Box>
    </ThemeProvider>
  </Fragment>
);

export default Layout;
