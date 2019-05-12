import React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import { Link as RebassLink } from 'rebass'

const Link = ({ children, to, ...props }) => {
  const internal = /^\/(?!\/)/.test(to)

  if (internal) {
    return (
      <GatsbyLink to={to} {...props}>
        {children}
      </GatsbyLink>
    )
  }

  return (
    <RebassLink href={to} {...props}>
      {children}
    </RebassLink>
  )
}

export default Link
