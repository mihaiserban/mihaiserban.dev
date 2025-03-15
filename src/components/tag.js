import React from "react";
import "../styles/scss/components/tag.scss";

const Tag = ({ children, ...otherProps }) => (
  <div className="tag" {...otherProps}>
    {children}
  </div>
);

export default Tag;
