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
      <div className="flex-parent flex-parent--center-main p32">
        <div className="flex-parent flex-parent--row flex-parent--wrap mt32">
          <About />
          <div className="divider ml32 mr32" />
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
      </div>
      <style jsx>{`
        .divider {
          background: linear-gradient(180deg, #e6e6e6 0, #e6e6e6 48%, #fff);
          width: 0.0625rem;
          height: 540px;
          bottom: 0;
        }
        .content {
          max-width: 80%;
          width: 700px;
        }
        @media screen and (max-width: 1032px) {
          .divider {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
