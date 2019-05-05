import React from 'react'
import { Flex, Box, Text, Link, Heading } from 'rebass'
import SEO from '../components/SEO'
import Layout from '../components/layout'

const profile = () => (
  <Layout>
    <Text fontFamily="body" lineHeight="body">
      <SEO />

      <Box pt={80}>
        <Heading fontFamily="heading" fontSize={6} mb={4}>
          Profile
        </Heading>
      </Box>

      <Box width={1}>
        <Text fontSize={2}>
          I'm a self taught web developer who loves all things tech. This blog serves as a medium to get me more
          involved in the industry, talk about the projects I'm working on, as well as post other random musings. I'm a
          huge movie buff, gaming nerd, and coffee lover. When I'm not in front of a screen, I'm most likely reading a
          good book or listening to music. Check out my{' '}
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
        <Heading fontFamily="heading" fontSize={[5, 4]} mb={3}>
          Projects
        </Heading>
      </Box>

      <Flex flexWrap="wrap" mx={-2}>
        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Text fontSize={3} mb={2}>
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

        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Text fontSize={3} mb={2}>
            <span role="img" aria-label="Tools">
              🛠{' '}
            </span>
            <Link color="black" href="https://github.com/jonleopard/dotfiles" target="_blank" rel="noopener noreferrer">
              Dotfiles
            </Link>
          </Text>
          <Text>A dotfile repo for my development environment</Text>
        </Box>

        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Text fontSize={3} mb={2}>
            <span role="img" aria-label="Hat">
              🎓{' '}
            </span>
            <Link color="black" href="https://github.com/jonleopard/dotfiles" target="_blank" rel="noopener noreferrer">
              Dotfile Starter
            </Link>
          </Text>
          <Text>A practice/starter guide on how to make your own dotfile repo</Text>
        </Box>
      </Flex>

      <Box width={1} mt={80}>
        <Heading fontFamily="heading" fontSize={[5, 4]} mb={3}>
          Skills
        </Heading>
      </Box>

      <Flex flexWrap="wrap" mx={-2}>
        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Text fontSize={3} mb={2}>
            ✨ Frontend
          </Text>
          <Text>React - Vue - Redux - NextJS</Text>
          <Text>Webpack - Babel - Prettier - ESLint</Text>
          <Text>GatsbyJS - Bootstrap - TailwindCSS - Styled Components</Text>
        </Box>
        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Text fontSize={3} mb={2}>
            ⚡Backend
          </Text>
          <Text>Node - Go - PHP - Laravel</Text>
          <Text>SQL - Docker - GraphQL</Text>
        </Box>
      </Flex>

      <Box width={1} mt={80}>
        <Heading fontFamily="heading" fontSize={[5, 4]} pb={3}>
          Experience
        </Heading>
      </Box>

      <Flex flexWrap="wrap" mx={-2}>
        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize={3} mb={2}>
              UpFX
            </Text>
            <Text>2014 - 2016</Text>
          </Flex>
          <Text>Frontend Designer & Project Manager</Text>
        </Box>

        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize={3} mb={2}>
              GoingUP
            </Text>
            <Text>2009 - 2010</Text>
          </Flex>
          <Text>Frontend Designer & Project Manager</Text>
        </Box>

        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize={3} mb={2}>
              1Cart
            </Text>
            <Text>2010 - 2013</Text>
          </Flex>
          <Text>Frontend Designer, Wireframer, Project Manager</Text>
        </Box>

        <Box width={[1, 1 / 2]} px={2} py={2}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize={3} mb={2}>
              TotalRecall
            </Text>
            <Text>2006 - 2008</Text>
          </Flex>
          <Text>Technician & Customer Support Representative</Text>
        </Box>
      </Flex>

      <Box width={1} mt={80}>
        <Heading fontFamily="heading" fontSize={[5, 4]} pb={3}>
          Certifications
        </Heading>
      </Box>

      <Flex flexWrap="wrap" mx={-2}>
        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2016 - LinuxAcademy</Text>
          <Text>Docker Quick Start</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2016 - LinuxAcademy</Text>
          <Text>Ansible Quick Start</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2016 - LinuxAcademy</Text>
          <Text>Introduction to Linux</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2016 - LinuxAcademy</Text>
          <Text>OpenStack Essentials</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2017 - Udemy</Text>
          <Text>Web Developer Bootcamp</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2017 - Udemy</Text>
          <Text>GraphQL with React</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2017 - Wes Bos</Text>
          <Text>LearnNode!</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2017 - Wes Bos</Text>
          <Text>ES6 for Everyone</Text>
        </Box>

        <Box width={[1 / 2, 1 / 3]} px={2} py={2}>
          <Text>2017 - Wes Bos</Text>
          <Text>React for Beginners</Text>
        </Box>
      </Flex>
    </Text>
  </Layout>
)

export default profile
