import React from 'react';
import Helmet from 'react-helmet';
import { graphql } from 'gatsby';
import { Flex, Box, Heading, Text, Link } from 'jonleopard-design-system';
import Layout from '../components/layout';

const profile = ({ data }) => {
  const meta = data.site.siteMetadata;
  return (
    <Layout>
      <Helmet title={`Profile - ${meta.defaultTitle}`}>
        <meta name="twitter:title" content={`Profile - ${meta.defaultTitle}`} />
        <meta name="twitter:description" content={meta.defaultDescription} />
      </Helmet>

      <Flex flexWrap="wrap">
        <Box width={1} pt={[20, 80]}>
          <Heading fontSize={[4, 5, 6]} pb={4}>
            Profile
          </Heading>
          <Text fontSize={[1, 2, 3]}>
            I'm a self taught web developer who loves all things tech. This blog
            serves as a medium to get me more involved in the industry, talk
            about the projects I'm working on, as well as post other random
            musings. I'm a huge movie buff, gaming nerd, and coffee lover. When
            I'm not in front of a screen, I'm most likely reading a good book or
            listening to music. Check out my{' '}
            <Link
              color="black"
              href="https://last.fm/user/crunkmastafunk"
              target="_blank"
              rel="noopener noreferrer"
            >
              last.fm
            </Link>{' '}
            and{' '}
            <Link
              color="black"
              href="https://goodreads.com/jonleopard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Goodreads
            </Link>{' '}
            profile to see what I'm into these days.
          </Text>
        </Box>

        <Box width={1} pt={[20, 50]}>
          <Heading pb={3}>Projects</Heading>
          <Flex flexWrap="wrap">
            <Box width={1 / 2}>
              <Text fontSize={[1, 2]} pb={2}>
                <span role="img" aria-label="Moon">
                  🌙
                </span>
                <Link
                  color="black"
                  href="https://github.com/jonleopard/lunarphase"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Moonphase.space
                </Link>
                <br />A tiny app that displays the current moon phase
              </Text>
            </Box>

            <Box width={[1 / 2, 1 / 2, 1 / 2]}>
              <Text fontSize={[1, 2]} pb={2}>
                <span role="img" aria-label="Tools">
                  🛠
                </span>
                <Link
                  color="black"
                  href="https://github.com/jonleopard/dotfiles"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dotfiles
                </Link>
                <br />A dotfile repo for my development environment
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box width={1} pt={[20, 50]}>
          <Heading pb={3}>Professional Experience</Heading>
          <Flex flexWrap="wrap">
            <Box width={1 / 2}>
              <Text fontSize={[1, 2]} pb={2}>
                2014 - 2016 <br /> Frontend Designer & Project Manager / UpFX
              </Text>
            </Box>
            <Box width={1 / 2}>
              <Text fontSize={[1, 2]} pb={2}>
                2010 - 2013 <br /> Frontend Designer, Wireframer, Project
                Manager / 1Cart
              </Text>
            </Box>
            <Box width={1 / 2}>
              <Text fontSize={[1, 2]} pb={2}>
                2009 - 2010 <br /> Frontend Designer & Project Manager / GoingUP
              </Text>
            </Box>
            <Box width={1 / 2}>
              <Text fontSize={[1, 2]} pb={2}>
                2006 - 2008 <br /> Technician & Customer Support Representative
                / TotalRecall
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box width={1} pt={[20, 50]}>
          <Heading pb={3}>Certifications</Heading>
          <Flex flexWrap="wrap">
            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2016 - LinuxAcademy <br /> Docker Quick Start
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2016 - LinuxAcademy <br /> Ansible Quick Start
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2016 - LinuxAcademy <br /> Introduction to Linux
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2016 - LinuxAcademy <br /> OpenStack Essentials
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2017 - Udemy <br /> Web Developer Bootcamp
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2017 - Udemy <br /> GraphQL with React
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2017 - Wes Bos <br /> LearnNode!
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2017 - Wes Bos <br /> ES6 for Everyone
              </Text>
            </Box>

            <Box width={1 / 3}>
              <Text fontSize={[1, 2]} pb={2}>
                2017 - Wes Bos <br /> React for Beginners
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default profile;

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
