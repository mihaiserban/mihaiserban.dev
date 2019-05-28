/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useContext } from "react";
import { useTransition, animated } from "react-spring";

// Components
import About from "./about";
import SEO from "./SEO";

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
      <SEO />
      <div className="flex-parent flex-parent--center-main p32 flex-parent--wrap layout">
        <div className="about">
          <About width={sideMenuWidth} />
        </div>
        <div className="flex-parent flex-parent--column content">
          <div>
            {transitions.map(({ item, key, props }) => (
              <animated.div key={key} style={props}>
                {children}
              </animated.div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .content {
          max-width: 80%;
          width: 700px;
        }
        .content {
          padding-left: 32px;
          padding-right: 32px;
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
