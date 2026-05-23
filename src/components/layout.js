/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useContext } from "react";
import { useTransition, animated } from "react-spring";

// Components
import About from "./about";
import Link from "./link";
import ThemeToggler from "./themeToggler";
import "../styles/scss/components/layout.scss";

// Create some context for other components
export const Context = React.createContext();
export const useAppContext = () => useContext(Context);

const sideMenuWidth = 240;

const Layout = ({ children, location }) => {
  // Page transition hook
  const [toggle, set] = useState(false);
  const transitions = useTransition(toggle, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <>
      <div className="flex justify-center p-8 flex-wrap layout">
        <div className="about">
          <About width={sideMenuWidth} />
        </div>
        <div className="flex flex-col items-center content">
          <div className="contentContainer">
            {transitions((styles, item, key) => (
              <animated.div key={key} style={styles}>
                {children}
              </animated.div>
            ))}
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
};

export default Layout;
