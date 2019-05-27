import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import styled, { keyframes } from 'styled-components';
import classNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTwitter,
  faLinkedin,
  faGithub,
  faStackOverflow,
  faInstagram,
  faGoodreads,
  faMedium,
} from '@fortawesome/free-brands-svg-icons';

import { faMapMarkerAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { H1, H2, H3, H4, H5 } from './text/headings';
import Link from './link';

const fade = keyframes`
  from {
    opacity: 0;

  to {
      opacity: 1;
    }
`;

const AnimatedBlock = styled.div`
  display: inline-block;
  animation: ${fade} 0.5s alternate infinite;
`;

const About = props => {
  const {
    width,
    data: {
      contentfulAbout: {
        name,
        email,
        twitter,
        linkedIn,
        github,
        stackoverflow,
        instagram,
        goodreads,
        medium,
        image,
        location,
        description,
      },
    },
  } = props;

  const currentPath = typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '');

  return (
    <div className="flex-parent flex-parent--row wrapper">
      <div className="flex-parent flex-parent--column container">
        <Link to="/">
          <img src={image.file.url} className="image" />
        </Link>

        <H2 className="mt8">
          <Link to="/" className="mt32">
            <span style={{ color: 'black' }}>{name}</span>
          </Link>
        </H2>
        <p className="mt8">
          <FontAwesomeIcon icon={faMapMarkerAlt} size="sm" /> {location}
        </p>
        <p className="mt8">
          {description}
          <AnimatedBlock>▌</AnimatedBlock>
        </p>
        <p className="mt16">
          Want to hire me for your next project?{' '}
          <a href="mailto:contact@mihaiserban.dev?subject=I would like to hire you">
            Get in touch.
          </a>
        </p>

        <div className="flex-parent flex-parent--column mt32">
          <Link to="/" className={classNames('menuLink', { active: currentPath === '' })}>
            About me
          </Link>
          <Link to={medium} className={classNames('menuLink mt4')}>
            Blog
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml8" />
          </Link>

          <Link
            to="/bookshelf"
            className={classNames('menuLink mt4', {
              active: currentPath === '/bookshelf',
            })}
          >
            Bookshelf
          </Link>
          <Link
            to="/projects"
            className={classNames('menuLink mt4', {
              active: currentPath === '/projects',
            })}
          >
            Projects
          </Link>
        </div>

        <div className="mt32 flex-parent flex-parent--row">
          <Link to={twitter}>
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faTwitter} />
            </div>
          </Link>
          <Link to={linkedIn} className="ml8">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
          </Link>
          <Link to={github} className="ml8">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faGithub} />
            </div>
          </Link>
          <Link to={stackoverflow} className="ml8">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faStackOverflow} />
            </div>
          </Link>
        </div>
        <div className="mt8 flex-parent flex-parent--row">
          <Link to={medium}>
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faMedium} />
            </div>
          </Link>
          <Link to={instagram} className="ml8">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faInstagram} />
            </div>
          </Link>
          <Link to={goodreads} className="ml8">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faGoodreads} />
            </div>
          </Link>
        </div>
      </div>
      <style jsx>
        {`
          .wrapper {
            width: ${width}px;
          }
          .wrapper:after {
            content: '';
            background: linear-gradient(180deg, #e6e6e6 0, #e6e6e6 48%, #fff);
            min-height: 540px;
            width: 1px;
            min-width: 1px;
            bottom: 0;
          }
          @media screen and (max-width: 1003px) {
            .wrapper:after {
              display: none;
            }
          }
          .image {
            width: 75px;
            height: 75px;
            border-radius: 50%;
          }
          .socialIcon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 1px solid #b6b6b6;
            color: #222;
            cursor: pointer;
            -webkit-transition: all 0.3s; /* Safari */
            transition: all 0.3s;
          }
          .socialIcon:hover {
            color: #2195ff;
          }
          :global(.menuLink) {
            color: #222;
            border-bottom: 1px solid transparent;
          }
          :global(.menuLink:hover) {
            color: #2195ff;
            border-bottom: 1px solid #2195ff;
          }
          :global(.active) {
            border-bottom: 1px solid #222;
          }
        `}
      </style>
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
      email
      description
      twitter
      linkedIn
      github
      stackoverflow
      instagram
      goodreads
      medium
      image {
        file {
          url
          fileName
          contentType
        }
      }
      location
    }
  }
`;
