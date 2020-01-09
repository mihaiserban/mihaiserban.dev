import React from "react";
import { graphql, StaticQuery } from "gatsby";
import styled, { keyframes } from "styled-components";
import classNames from "classnames";
import Img from "gatsby-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faLinkedin,
  faGithub,
  faStackOverflow,
  faInstagram,
  faGoodreads,
  faMedium
} from "@fortawesome/free-brands-svg-icons";

import {
  faMapMarkerAlt,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";

import Link from "./link";

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
        description
      }
    }
  } = props;

  const currentPath =
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/$/, "");

  return (
    <div className="flex-parent flex-parent--row wrapper">
      <div className="flex-parent flex-parent--column container">
        <Link to="/" aria-label="Home">
          <Img
            fixed={image.fixed}
            className="image"
            alt="Headshot Mihai Serban"
          />
        </Link>

        <h2 className="mt8">
          <Link to="/" className="mt32" aria-label="Home">
            <span style={{ color: "var(--primary-color)" }}>{name}</span>
          </Link>
        </h2>
        <p className="mt8">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            size="sm"
            style={{ width: "11px", height: "14px" }}
          />{" "}
          {location}
        </p>
        <span className="mt8 description">
          {description}
          <AnimatedBlock>▌</AnimatedBlock>
        </span>
        <p className="mt16 description">
          Want to hire me for your next project?{" "}
          <a
            href={`mailto:${process.env.GATSBY_EMAIL}?subject=I would like to hire you`}
          >
            Get in touch.
          </a>
        </p>

        <div className="flex-parent flex-parent--column mt32">
          <Link
            to="/"
            aria-label="Home"
            className={classNames("menuLink", { active: currentPath === "" })}
          >
            About me
          </Link>
          <Link
            aria-label="Head over to my Medium blog"
            to={medium}
            className={classNames("menuLink mt4")}
          >
            Blog
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml8" />
          </Link>

          <Link
            aria-label="Head over to my Bookshelf page"
            to="/bookshelf"
            className={classNames("menuLink mt4", {
              active: currentPath === "/bookshelf"
            })}
          >
            Bookshelf
          </Link>
          <Link
            aria-label="Head over to my projects page"
            to="/projects"
            className={classNames("menuLink mt4", {
              active: currentPath === "/projects"
            })}
          >
            Projects
          </Link>
          <Link
            aria-label="Head over to my tech stack page"
            to="/uses"
            className={classNames("menuLink mt4", {
              active: currentPath === "/uses"
            })}
          >
            Uses
          </Link>
        </div>

        <div className="mt32 flex-parent flex-parent--row">
          <Link to={twitter} aria-label="Head over to my Twitter">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faTwitter} />
            </div>
          </Link>
          <Link
            to={linkedIn}
            className="ml8"
            aria-label="Head over to my LinkedIn"
          >
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
          </Link>
          <Link to={github} className="ml8" aria-label="Head over to my Github">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faGithub} />
            </div>
          </Link>
          <Link
            to={stackoverflow}
            className="ml8"
            aria-label="Head over to my StackOverflow"
          >
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faStackOverflow} />
            </div>
          </Link>
        </div>
        <div className="mt8 flex-parent flex-parent--row">
          <Link to={medium} aria-label="Head over to my Medium blog">
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faMedium} />
            </div>
          </Link>
          <Link
            to={instagram}
            className="ml8"
            aria-label="Head over to my Instagram"
          >
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faInstagram} />
            </div>
          </Link>
          <Link
            to={goodreads}
            className="ml8"
            aria-label="Head over to my Goodreads"
          >
            <div className="socialIcon flex-parent flex-parent--center-cross flex-parent--center-main">
              <FontAwesomeIcon icon={faGoodreads} />
            </div>
          </Link>
        </div>
      </div>
      <style jsx>
        {`
          .description {
            color: var(--secondary-color);
          }
          .wrapper {
            width: ${width}px;
          }
          .wrapper:after {
            content: "";
            background: linear-gradient(
              180deg,
              var(--separator-color) 0,
              var(--separator-color) 48%,
              var(--bg)
            );
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
          :global(.image) {
            width: 75px;
            height: 75px;
            border-radius: 50%;
          }
          .socialIcon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 1px solid var(--separator-color);
            color: var(--primary-color);
            cursor: pointer;
            -webkit-transition: all 0.3s; /* Safari */
            transition: all 0.3s;
          }
          .socialIcon:hover {
            color: var(--textLink);
          }
          :global(.menuLink) {
            color: var(--primary-color);
            border-bottom: 1px solid transparent;
          }
          :global(.menuLink:hover) {
            color: var(--textLink);
            border-bottom: 1px solid var(--textLink);
          }
          :global(.active) {
            border-bottom: 1px solid var(--primary-color);
          }
        `}
      </style>
    </div>
  );
};

const SEO = props => (
  <StaticQuery
    query={queryAbout}
    render={data => <About {...props} data={data} />}
  />
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
        fixed(width: 150, quality: 90) {
          base64
          width
          height
          src
          srcSet
          srcWebp
          srcSetWebp
        }
      }
      location
    }
  }
`;
