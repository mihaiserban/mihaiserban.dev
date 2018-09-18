import React from 'react';
import Helmet from 'react-helmet';
import { graphql } from 'gatsby';
import { Flex, Box } from 'grid-styled';
import { fontSize } from 'styled-system';
import Layout from 'components/layout';
import PageHeader from 'components/page-header';

export default ({ data }) => {
  const meta = data.site.siteMetadata;
  return (
    <Layout>
      <Helmet title={`Profile - ${meta.defaultTitle}`}>
        <meta name="twitter:title" content={`Profile - ${meta.defaultTitle}`} />
        <meta name="twitter:description" content={meta.defaultDescription} />
      </Helmet>
      <PageHeader title="Profile" />
      <div>
        <p style={{ fontSize: 20 }}>
          I'm a self taught web developer who loves all things tech. This blog
          serves as a medium to get me more involved in the industry, talk about
          the projects I'm working on, as well as post other random musings. I'm
          a huge movie buff, gaming nerd, and coffee lover. When I'm not in
          front of a screen, I'm most likely reading a good book or listening to
          music. Check out my{' '}
          <a
            href="https://last.fm/user/crunkmastafunk"
            target="_blank"
            rel="noopener noreferrer"
          >
            last.fm
          </a>{' '}
          and and{' '}
          <a
            href="https://goodreads.com/jonleopard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Goodreads
          </a>{' '}
          profile to see what I'm into these days.
        </p>
      </div>

      <div>
        <PageHeader title="Projects"/>
        <Flex>
          <Box width={[1 / 2, 1 / 2, 1 / 2]} mr={3}>
            <p fontSize={[1, 2]} pb={2}>
              <span role="img" aria-label="Moon">
                🌙
              </span>
              <a
                href="https://github.com/jonleopard/lunarphase"
                target="_blank"
                rel="noopener noreferrer"
              >
                Moonphase.space
              </a>
              <br />
              A tiny app that displays the current moon phase
            </p>
          </Box>
          <Box width={[1 / 2, 1 / 2, 1 / 2]}>
            <p fontSize={[1, 2]} pb={2}>
              <span role="img" aria-label="Tools">
                🛠
              </span>
              <a
                href="https://github.com/jonleopard/dotfiles"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dotfiles
              </a>
              <br />
              A dotfile repo for my development environment
            </p>
          </Box>
        </Flex>
      </div>

      <PageHeader title="Professional Experience" />
        <p fontSize={[1, 2]} pb={2}>
          2014 - 2016 <br /> Frontend Designer & Project Manager / UpFX
        </p>
        <p fontSize={[1, 2]} pb={2}>
          2010 - 2013 <br /> Frontend Designer, Wireframer, Project Manager /
          1Cart
        </p>
        <p fontSize={[1, 2]} pb={2}>
          2009 - 2010 <br /> Frontend Designer & Project Manager / GoingUP
        </p>
        <p fontSize={[1, 2]} pb={2}>
          2006 - 2008 <br /> Technician & Customer Support Representative /
          TotalRecall
        </p>

        <PageHeader title="Certifications"/>
      <Flex flexWrap="wrap">
        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2016 - LinuxAcademy <br /> Docker Quick Start
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2016 - LinuxAcademy <br /> Ansible Quick Start
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2016 - LinuxAcademy <br /> Introduction to Linux
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2016 - LinuxAcademy <br /> OpenStack Essentials
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2017 - Udemy <br /> Web Developer Bootcamp
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2017 - Udemy <br /> GraphQL with React
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2017 - Wes Bos <br /> LearnNode!
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2017 - Wes Bos <br /> ES6 for Everyone
          </p>
        </Box>

        <Box width={[1 / 2, 1 / 2, 1 / 3]}>
          <p fontSize={[1, 2]} pb={2}>
            2017 - Wes Bos <br /> React for Beginners
          </p>
        </Box>
      </Flex>
    </Layout>
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
