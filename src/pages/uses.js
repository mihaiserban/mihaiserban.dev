import React from "react";
import { Link as glink, graphql } from "gatsby";
import classNames from "classnames";
import { GatsbyImage } from "gatsby-plugin-image";

import Link from "../components/link";
import Layout from "../components/layout";
import SEO from "../components/SEO";

const Page = () => {
  return (
    <Layout>
      <SEO title="Uses - Mihai Serban" />
      <div>
        <h1 className="mb-2">Uses</h1>
        <p className="mt-4">
          Here you'll find the software and hardware that help me be productive.
        </p>
        <h3 className="mt-4">Editors + Terminal</h3>
        <ul className="list-disc list-inside mt-1">
          <li>
            <a href="https://code.visualstudio.com/" target="_blank">
              Visual Studio Code
            </a>
          </li>
          <li>XCode</li>
          <li>
            <a href="https://ohmyz.sh/" target="_blank">
              ZSH
            </a>{" "}
            as my default Terminal
          </li>
        </ul>
        <h3 className="mt-4">VSCode Extensions</h3>
        <ul className="list-disc list-inside mt-1">
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark"
              target="_blank"
            >
              Atom One Dark Theme
            </a>{" "}
            for Visual Studio Code
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"
              target="_blank"
            >
              Prettier
            </a>{" "}
            - Code formatter
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense"
              target="_blank"
            >
              npm Intellisense
            </a>{" "}
            - Visual Studio Code plugin that autocompletes npm modules in import
            statements
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=kamikillerto.vscode-colorize"
              target="_blank"
            >
              colorize
            </a>{" "}
            - A vscode extension to help visualize css colors in files.
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=formulahendry.terminal"
              target="_blank"
            >
              Terminal
            </a>{" "}
            - Terminal for Visual Studio Code
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode"
              target="_blank"
            >
              Visual Studio IntelliCode
            </a>{" "}
            - provides AI-assisted development features
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons"
              target="_blank"
            >
              vscode-icons
            </a>{" "}
            - Icons for Visual Studio Code
          </li>
          <li>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one"
              target="_blank"
            >
              Markdown All in One
            </a>{" "}
            - All you need to write Markdown (keyboard shortcuts, table of
            contents, auto preview and more)
          </li>
        </ul>
        <h3 className="mt-4">Desktop Apps</h3>
        <ul className="list-disc list-inside mt-1">
          <li>
            <a href="https://www.lastpass.com/" target="_blank">
              LastPass
            </a>
          </li>
          <li>
            <a href="https://www.getpostman.com/" target="_blank">
              Postman
            </a>
          </li>
          <li>
            <a href="https://getstation.com/" target="_blank">
              Station
            </a>
          </li>
          <li>
            <a href="https://www.spotify.com/" target="_blank">
              Spotify
            </a>
          </li>
          <li>
            <a href="https://www.zeplin.io/" target="_blank">
              Zeplin
            </a>
          </li>
          <li>
            <a href="https://www.figma.com/" target="_blank">
              Figma
            </a>
          </li>
          <li>
            <a href="https://www.discordapp.com" target="_blank">
              Discord
            </a>
          </li>
          <li>
            <a href="https://www.slack.com/" target="_blank">
              Slack
            </a>
          </li>
          <li>
            <a href="https://freemacsoft.net/tiles/" target="_blank">
              Tiles
            </a>{" "}
            - window manager which allows you to easily reorganize windows by
            either dragging them to the edges of the screen, using keyboard
            shortcuts, or the menu bar
          </li>
          <li>
            <a href="https://www.toptal.com/tracker" target="_blank">
              TopTracker by Toptal
            </a>{" "}
            - time tracking for my freelancing work
          </li>
        </ul>
        <img
          src="/images/desk.jpg"
          alt="Battle station"
          className="deskSetup mt-8"
        />
      </div>
    </Layout>
  );
};

export default Page;
