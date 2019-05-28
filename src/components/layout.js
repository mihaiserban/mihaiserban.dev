/* eslint-disable */
// TODO: disabling until I can reconfigure rules
import React, { useState, useContext } from "react";
import { useTransition, animated } from "react-spring";

// Components
import About from "./about";
import SEO from "./SEO";
import Link from "./link";

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
        <div className="flex-parent flex-parent--column flex-parent--center-cross content">
          <div>
            {transitions.map(({ item, key, props }) => (
              <animated.div key={key} style={props}>
                {children}
              </animated.div>
            ))}
          </div>
          <div className="flex-parent flex-parent--row flex-parent--center-cross mt32">
            <img
              className="smallImage"
              alt="gatsby"
              src="https://images.ctfassets.net/usz05rcag1x3/3xrfXp4jzSWda6PfiuAlzW/2ec950b6b4d7dc5a4ca7a2e6c026697f/gatsby.png?w=60&h=60&q=50"
            />
            &nbsp; + &nbsp;
            <img
              className="smallImage"
              alt="gatsby"
              src="https://images.ctfassets.net/usz05rcag1x3/5hgOPLAFzhBe5LVS66skmY/ea72f74698a547ecc8bf7ac4469cecb9/contentful.png?w=60&h=60&q=50"
            />
            &nbsp; + &nbsp;
            <img
              className="smallImage"
              alt="netlify"
              src="http://images.ctfassets.net/usz05rcag1x3/3N5hID2Er4NG6Bw15u0xWa/57c71b3ef3c46ca45d29de3b91f1d9a9/logomark.png?w=60&h=60&q=50"
            />
            &nbsp; = ❤️
            <Link to="https://github.com/mihaiserban/mihaiserban.dev" className="ml4">
              [Source code]
            </Link>
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
        .smallImage {
          width: 14px;
          height: auto;
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
