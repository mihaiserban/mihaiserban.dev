import React from "react";

// Components
import About from "./about";
import Link from "./link";
import ThemeToggler from "./themeToggler";
import "../styles/scss/components/layout.scss";

const sideMenuWidth = 260;

const Layout = ({ children }) => (
  <>
    <div className="flex justify-center p-8 layout">
      <div className="about">
        <About width={sideMenuWidth} />
      </div>
      <div className="flex flex-col items-center content">
        <div className="contentContainer">
          {children}
          <div className="themeToggler">
            <ThemeToggler />
          </div>
        </div>

        <footer className="footer">
          Built with Gatsby + Netlify
          <Link
            to="https://github.com/mihaiserban/mihaiserban.dev"
            aria-label="Source code for mihaiserban.dev"
          >
            Source code
          </Link>
        </footer>
      </div>
    </div>
  </>
);

export default Layout;
