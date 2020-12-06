import React from "react";
import { ThemeToggler } from "gatsby-plugin-dark-mode";

class ThemeTogglerComponent extends React.Component {
  render() {
    return (
      <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <div className="flex-parent flex-parent--row flex-parent--center-cross">
            <input
              type="checkbox"
              onChange={(e) => toggleTheme(e.target.checked ? "dark" : "light")}
              checked={theme === "dark"}
              color="var(--textLink)"
            />{" "}
            <span className="ml-2.5">Dark mode</span>
          </div>
        )}
      </ThemeToggler>
    );
  }
}

export default ThemeTogglerComponent;
