import React from 'react';
import Helmet from 'react-helmet';

import PageHeader from '../components/page-header';
import { H3, Text, P } from '../components/typography';
import Section, { SectionTitle } from '../components/section';

export default ({ data }) => {
  const meta = data.site.siteMetadata;
  return (
    <main>
      <Helmet title={`Profile - ${meta.defaultTitle}`}>
        <meta name="twitter:title" content={`Profile - ${meta.defaultTitle}`} />
        <meta name="twitter:description" content={meta.defaultDescription} />
      </Helmet>
      <PageHeader title="Profile" />
      <Section>
        <P>
          Hi, my name is Jon. I'm a self taught web developer who loves all
          things tech. This blog serves as a medium to get me more involved in
          the industry, talk about the projects I'm working on, as well as post
          other random musings. I'm a huge movie buff, gaming nerd, and coffee
          lover. When I'm not in front of a screen, I'm most likely reading a
          good book or listening to music. Check out my last.fm and Goodreads
          profile to see what I'm into these days.
        </P>
      </Section>
      <Section>
        <SectionTitle>Professional Experience</SectionTitle>
        <P>2014 - 2016 Frontend Designer & Project Manager / UpFX</P>
        <P>
          2010 - 2013 Frontend Designer, Wireframer, Project Manager / 1Cart
        </P>
        <P>2009 - 2010 Frontend Designer & Project Manager / GoingUP</P>
        <P>
          2006 - 2008 Technician & Customer Support Representative / TotalRecall
        </P>
      </Section>

    </main>
  );
};

export const pageQuery = graphql`
  query ProfileQuery {
    site {
      siteMetadata {
        defaultTitle
        defaultDescription
      }
    }
  }
`;
