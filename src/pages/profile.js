import React from 'react'
import { Flex, Box, Text, Link, Heading } from 'rebass'
import SEO from '../components/SEO'
import Layout from '../components/layout'

const profile = () => (
  <Layout>
    <SEO />

    <Box pt={80}>
      <Heading fontSize={6} pb={4}>
        Profile
      </Heading>
    </Box>
    <Box fontSize={3} width={1}>
      <Text>
        I'm a self taught web developer who loves all things tech. This blog serves as a medium to get me more involved
        in the industry, talk about the projects I'm working on, as well as post other random musings. I'm a huge movie
        buff, gaming nerd, and coffee lover. When I'm not in front of a screen, I'm most likely reading a good book or
        listening to music. Check out my{' '}
        <Link color="black" href="https://last.fm/user/crunkmastafunk" target="_blank" rel="noopener noreferrer">
          last.fm
        </Link>{' '}
        and{' '}
        <Link color="black" href="https://goodreads.com/jonleopard" target="_blank" rel="noopener noreferrer">
          Goodreads
        </Link>{' '}
        profile to see what I'm into these days.
      </Text>
    </Box>

    <Box width={1} mt={80}>
      <Heading fontSize={[5, 4]} pb={3}>
        Projects
      </Heading>
    </Box>

    <Box fontSize={[3, 2]} width={1}>
      <Flex flexWrap="wrap">
        <Box width={[1, 1 / 2]} mb={[3, 0]}>
          <Text fontWeight={500} mb={1}>
            <span role="img" aria-label="Moon">
              🌙{' '}
            </span>
            <Link
              color="black"
              href="https://github.com/jonleopard/lunarphase"
              target="_blank"
              rel="noopener noreferrer"
            >
              Moonphase.space
            </Link>
          </Text>
          <Text>A tiny app that displays the current moon phase</Text>
        </Box>

        <Box width={[1, 1 / 2]}>
          <Text fontWeight={500} mb={1}>
            <span role="img" aria-label="Tools">
              🛠{' '}
            </span>
            <Link color="black" href="https://github.com/jonleopard/dotfiles" target="_blank" rel="noopener noreferrer">
              Dotfiles
            </Link>
          </Text>
          <Text>A dotfile repo for my development environment</Text>
        </Box>
      </Flex>
    </Box>

    <Box width={1} mt={80}>
      <Heading fontSize={[5, 4]} pb={3}>
        Professional Experience
      </Heading>
    </Box>

    <Box fontSize={[3, 2]} width={1}>
      <Flex flexWrap="wrap">
        <Box width={[1, 1 / 2]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2014 - 2016
          </Text>
          <Text>Frontend Designer & Project Manager / UpFX</Text>
        </Box>

        <Box width={[1, 1 / 2]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2010 - 2013
          </Text>
          <Text>Frontend Designer, Wireframer, Project Manager / 1Cart</Text>
        </Box>

        <Box width={[1, 1 / 2]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2009 - 2010
          </Text>
          <Text>Frontend Designer & Project Manager / GoingUP</Text>
        </Box>

        <Box width={[1, 1 / 2]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2006 - 2008
          </Text>
          <Text>Technician & Customer Support Representative / TotalRecall</Text>
        </Box>
      </Flex>
    </Box>

    <Box width={1} mt={80}>
      <Heading fontSize={[5, 4]} pb={3}>
        Certifications
      </Heading>
    </Box>

    <Box fontSize={[3, 2]} width={1}>
      <Flex flexWrap="wrap">
        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2016 - LinuxAcademy
          </Text>
          <Text>Docker Quick Start</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2016 - LinuxAcademy
          </Text>
          <Text>Ansible Quick Start</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2016 - LinuxAcademy
          </Text>
          <Text>Introduction to Linux</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2016 - LinuxAcademy
          </Text>
          <Text>OpenStack Essentials</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2017 - Udemy
          </Text>
          <Text>Web Developer Bootcamp</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2017 - Udemy
          </Text>
          <Text>GraphQL with React</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2017 - Wes Bos
          </Text>
          <Text>LearnNode!</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2017 - Wes Bos
          </Text>
          <Text>ES6 for Everyone</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} mb={3}>
          <Text fontWeight={500} mb={1}>
            2017 - Wes Bos
          </Text>
          <Text>React for Beginners</Text>
        </Box>
      </Flex>
    </Box>
  </Layout>
)

export default profile
