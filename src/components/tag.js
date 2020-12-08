import React from "react";

const Tag = ({ children, ...otherProps }) => (
  <div className="tag" {...otherProps}>
    {children}
    <style jsx>
      {`
        .tag {
          padding-top: 2px;
          padding-bottom: 2px;
          padding-left: 12px;
          padding-right: 12px;
          border: 1px solid var(--separator-color);
          border-radius: 15px;
          margin: 4px;
          font-size: 12px;
        }
      `}
    </style>
  </div>
);

export default Tag;
