/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useContext } from "react";
import { useTransition, animated } from "react-spring";

// Components
import About from "./about";
import SEO from "./SEO";
import Footer from "./footer";
import NavBar from "./navbar";

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
      <div className="flex-parent flex-parent--row flex-parent--center-main flex-parent--wrap mt64">
        <About />

        <div className="flex-parent flex-parent--column">
          <NavBar />

          <div>
            {transitions.map(({ item, key, props }) => (
              <animated.div key={key} style={props}>
                {children}
              </animated.div>
            ))}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Layout;
