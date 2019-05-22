import React from 'react';
import { Link as GatsbyLink } from 'gatsby';

const Link = ({ children, to, ...props }) => {
  const internal = /^\/(?!\/)/.test(to);

  console.log(to, internal);
  if (internal) {
    return (
      <GatsbyLink to={to} {...props} style={{ width: 'fit-content' }}>
        {children}
      </GatsbyLink>
    );
  }

  return (
    <a
      href={to}
      {...props}
      style={{ width: 'fit-content' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export default Link;
