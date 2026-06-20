import React from "react";

// Components
import About from "./about";
import Link from "./link";
import ThemeToggler from "./themeToggler";
import "../styles/scss/components/layout.scss";

const sideMenuWidth = 240;

const Layout = ({ children }) => (
  <>
    <div className="flex justify-center p-8 flex-wrap layout">
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

        <div className="flex justify-center mt-8">
          <div className="flex flex-row items-center">
            Built with Gatsby + Netlify = ❤️
            <Link
              to="https://github.com/mihaiserban/mihaiserban.dev"
              className="ml-4"
              aria-label="Source code for mihaiserban.dev"
            >
              [Source code]
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Layout;
