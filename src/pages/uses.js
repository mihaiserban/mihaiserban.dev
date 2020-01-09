import React from "react";
import { Link as glink, graphql } from "gatsby";
import classNames from "classnames";

import Link from "../components/link";
import Layout from "../components/layout";

const Page = () => {
  return (
    <Layout>
      <div>
        <h1>Uses</h1>
        <p className="mt16">
          Here's the software and hardware that help me be productive.
        </p>
        <h3>Editors + Terminal</h3>
        <ul className="list">
          <li>
            <a href="https://code.visualstudio.com/" target="_blank">
              Visual Studio Code
            </a>{" "}
            for anything web related
          </li>
          <li>XCode for iOS development</li>
          <li>
            <a href="https://hyper.is/" target="_blank">
              Hyper.js
            </a>{" "}
            +{" "}
            <a href="https://ohmyz.sh/" target="_blank">
              ZSH
            </a>{" "}
            as my default Terminal
          </li>
          <li>Safari as my main browser. Chrome for web development.</li>
        </ul>
        <h3>VSCode Extensions</h3>
        <ul className="list">
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
        <h3>Desktop Apps</h3>
        <ul className="list">
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
        <h3>Hardware</h3>
        <ul className="list">
          <li>Macbook Pro 15" 2016</li>
          <li>AirPods</li>
          <li>iPhone X</li>
          <li>
            <a href="https://www.samsung.com/us/business/products/computing/monitors/800-series/cj890-series-43-curved-lc43j890dknxza/">
              C43J890DKN - 43" Samsung Super Ultra-Wide Monitor
            </a>{" "}
            - with USB-C support ❤️
          </li>
        </ul>
        <h3>PC Build</h3>
        <ul className="list">
          <li>Case - NZXT H510</li>
          <li>CPU - AMD Ryzen 7 2700X 3.7 GHz 8-Core Processor</li>
          <li>Motherboard - Gigabyte B450 AORUS M Micro ATX AM4 </li>
          <li>
            Memory - Kingston HyperX Predator RGB 16 GB (2 x 8 GB) DDR4-3200
          </li>
          <li>Storage - 2x Kingston A400 480 GB 2.5" Solid State Drive </li>
          <li>Video Card - Sapphire Radeon RX 580 8 GB PULSE Video Card </li>
        </ul>
      </div>
      <style jsx>
        {`
          .list {
            padding-left: 0px;
          }
          .list li {
            margin: 0px;
          }
        `}
      </style>
    </Layout>
  );
};

export default Page;
