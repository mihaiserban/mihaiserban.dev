import React from 'react';
import { graphql, StaticQuery } from 'gatsby';

const About = props => {
  const {
    data: {
      contentfulAbout: {
        name,
        description,
        email,
        twitter,
        linkedIn,
        github,
        stackoverflow,
        instagram,
        goodreads,
        image,
      },
    },
  } = props;

  return (
    <div className="flex-parent flex-parent--column">
      <span>{name}</span>
    </div>
  );
};

const SEO = props => (
  <StaticQuery query={queryAbout} render={data => <About {...props} data={data} />} />
);

export default SEO;

const queryAbout = graphql`
  query AboutQuery {
    contentfulAbout {
      name
      description
      email
      twitter
      linkedIn
      github
      stackoverflow
      instagram
      goodreads
      image {
        file {
          url
          fileName
          contentType
        }
      }
    }
  }
`;
