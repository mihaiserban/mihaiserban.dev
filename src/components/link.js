import React from 'react';
import { Link as GatsbyLink } from 'gatsby';

const Link = ({ children, to, ...props }) => {
  const internal = /^\/(?!\/)/.test(to);

  if (internal) {
    return (
      <GatsbyLink to={to} {...props}>
        {children}
      </GatsbyLink>
    );
  }

  return (
    <a href={to} {...props}>
      {children}
    </a>
  );
};

export default Link;
