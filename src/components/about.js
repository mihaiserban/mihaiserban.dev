import { useStaticQuery, graphql } from "gatsby";
import {
  faGithub,
  faGoodreads,
  faInstagram,
  faLinkedin,
  faMedium,
  faStackOverflow,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import styled, { keyframes } from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "./link";
import React from "react";
import classNames from "classnames";
import "../styles/scss/components/about.scss";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const fade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const AnimatedBlock = styled.div`
  display: inline-block;
  animation: ${fade} 0.5s alternate infinite;
`;

const About = (props) => {
  const { width } = props;
  const data = useStaticQuery(queryAbout);
  const {
    markdownRemark: {
      frontmatter: {
        name,
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
  } = data;

  const currentPath =
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/$/, "");

  return (
    <div className="flex flex-row wrapper" style={{ width: `${width}px` }}>
      <div className="flex flex-col container">
        <Link to="/" aria-label="Home">
          <img src={image} className="image" alt="Headshot Mihai Serban" />
        </Link>

        <h2 className="mt-2">
          <Link to="/" className="mt-8" aria-label="Home">
            <span style={{ color: "var(--primary-color)" }}>{name}</span>
          </Link>
        </h2>
        <p className="mt-2">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            size="sm"
            style={{ width: "11px", height: "14px" }}
          />{" "}
          {location}
        </p>
        <span className="mt-2 description">
          {description}
          <AnimatedBlock>▌</AnimatedBlock>
        </span>
        <p className="mt-4 description">
          Want to hire me for your next project?{" "}
          <a href={`mailto:${process.env.GATSBY_EMAIL}?subject=Hey 👋`}>
            Get in touch.
          </a>
        </p>

        <div className="flex flex-col mt-8">
          <Link
            to="/"
            aria-label="Blog"
            className={classNames("menuLink", { active: currentPath === "" })}
          >
            Blog
          </Link>
          <Link
            to="/about"
            aria-label="About me"
            className={classNames("menuLink", {
              active: currentPath === "/about",
            })}
          >
            About me
          </Link>
          <Link
            aria-label="Head over to my Bookshelf page"
            to="/bookshelf"
            className={classNames("menuLink mt-1", {
              active: currentPath === "/bookshelf",
            })}
          >
            Bookshelf
          </Link>
          <Link
            aria-label="Head over to my projects page"
            to="/projects"
            className={classNames("menuLink mt-1", {
              active: currentPath === "/projects",
            })}
          >
            Projects
          </Link>
          <p className="mt-4 bold">Apps</p>
          <Link
            aria-label="Head over to the design pattern generator"
            to="/design-pattern-generator-generator"
            className={classNames("menuLink mt-1", {
              active: currentPath === "/design-pattern-generator-generator",
            })}
          >
            Design Pattern Generator
          </Link>
        </div>

        <div className="mt-8 flex flex-row">
          <Link to={twitter} aria-label="Head over to my X">
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faXTwitter} />
            </div>
          </Link>
          <Link
            to={linkedIn}
            className="ml-4"
            aria-label="Head over to my LinkedIn"
          >
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
          </Link>
          <Link
            to={github}
            className="ml-4"
            aria-label="Head over to my Github"
          >
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faGithub} />
            </div>
          </Link>
          <Link
            to={stackoverflow}
            className="ml-4"
            aria-label="Head over to my StackOverflow"
          >
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faStackOverflow} />
            </div>
          </Link>
        </div>
        <div className="mt-2 flex flex-row">
          <Link to={medium} aria-label="Head over to my Medium blog">
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faMedium} />
            </div>
          </Link>
          <Link
            to={instagram}
            className="ml-4"
            aria-label="Head over to my Instagram"
          >
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faInstagram} />
            </div>
          </Link>
          <Link
            to={goodreads}
            className="ml-4"
            aria-label="Head over to my Goodreads"
          >
            <div className="socialIcon flex items-center justify-center">
              <FontAwesomeIcon icon={faGoodreads} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

const queryAbout = graphql`
  query AboutQuery {
    markdownRemark(fileAbsolutePath: { regex: "/content/about/bio.md/" }) {
      frontmatter {
        name
        description
        twitter
        linkedIn
        github
        stackoverflow
        instagram
        goodreads
        medium
        location
        image
      }
    }
  }
`;
