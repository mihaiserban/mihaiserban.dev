/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useContext } from "react";
import { useTransition, animated } from "react-spring";

// Components
import About from "./about";
import Link from "./link";
import ThemeToggler from "./themeToggler";

// Create some context for other components
export const Context = React.createContext();
export const useAppContext = () => useContext(Context);

const sideMenuWidth = 240;

const Layout = ({ children, location }) => {
  // Page transition hook
  const [toggle, set] = useState(false);
  const transitions = useTransition(toggle, null, {
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
            {transitions.map(({ item, key, props }) => (
              <animated.div key={key} style={props}>
                {children}
              </animated.div>
            ))}
            <div className="themeToggler">
              <ThemeToggler />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex flex-row items-center">
              <img
                className="smallImage"
                alt="gatsby"
                src="https://images.ctfassets.net/usz05rcag1x3/3xrfXp4jzSWda6PfiuAlzW/d9406ab839570d55c77ebae5bc611685/gatsby-logo.png?w=1200&h=1200&q=90"
              />
              &nbsp; + &nbsp;
              <img
                className="smallImage"
                alt="contentful"
                src="https://images.ctfassets.net/usz05rcag1x3/5hgOPLAFzhBe5LVS66skmY/ea72f74698a547ecc8bf7ac4469cecb9/contentful.png?w=120&h=120&q=90"
              />
              &nbsp; + &nbsp;
              <img
                className="smallImage"
                alt="netlify"
                src="https://images.ctfassets.net/usz05rcag1x3/3N5hID2Er4NG6Bw15u0xWa/57c71b3ef3c46ca45d29de3b91f1d9a9/logomark.png?w=120&h=120&q=90"
              />
              &nbsp; = ❤️
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
      <style jsx>{`
        .content {
          max-width: 80%;
          width: 700px;
        }
        .contentContainer {
          position: relative;
          width: 100%;
        }
        .content {
          padding-left: 32px;
          padding-right: 32px;
        }
        .smallImage {
          width: 14px;
          height: auto;
        }
        .themeToggler {
          position: absolute;
          right: 0;
          top: 0px;
        }
        @media screen and (max-width: 1003px) {
          .layout {
            justify-content: left;
          }
          .content {
            padding-top: 32px;
            padding-left: 0px;
            padding-right: 0px;
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
