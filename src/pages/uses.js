import React from "react";
import { Link as glink, graphql } from "gatsby";
import classNames from "classnames";
import Img from "gatsby-image";

import Link from "../components/link";
import Layout from "../components/layout";

const Page = () => {
  return (
    <Layout>
      <div>
        <h1 className="mb-2">Uses</h1>
        <p className="mt-4">
          Here you'll find the software and hardware that help me be productive.
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
        <h3>Hardware</h3>
        <ul className="list">
          <li>AirPods</li>
          <li>iPhone 11</li>
          <li>
            <a
              target="_blank"
              href="https://www.samsung.com/us/business/products/computing/monitors/800-series/cj890-series-43-curved-lc43j890dknxza/"
            >
              C43J890DKN - 43" Samsung Super Ultra-Wide Monitor
            </a>{" "}
            - with USB-C support ❤️
          </li>
        </ul>
        <h3>PC Build</h3>
        <p>
          A Hackintosh I made for fun. Dual boot with Windows and Mac OS Big
          Sur. Working OpenCore config on{" "}
          <a href="https://github.com/mihaiserban/hackintosh_z390_designare_coffee_lake">
            GitHub
          </a>
        </p>
        <table class="pcpp-part-list">
          <thead>
            <tr>
              <th>Type</th>
              <th>Item</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="pcpp-part-list-type">CPU</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/MBMwrH/intel-core-i5-9600kf-37-ghz-6-core-processor-bx80684i59600kf">
                  Intel Core i5-9600KF 3.7 GHz 6-Core Processor
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">CPU Cooler</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/dMVG3C/noctua-nh-u12s-chromaxblack-55-cfm-cpu-cooler-nh-u12s-chromaxblack">
                  Noctua NH-U12S chromax.black 55 CFM CPU Cooler
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Motherboard</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/ycL48d/gigabyte-z390-designare-atx-lga1151-motherboard-z390-designare">
                  Gigabyte Z390 DESIGNARE ATX LGA1151 Motherboard
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Memory</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/rpsmP6/kingston-hyperx-predator-rgb-16-gb-2-x-8-gb-ddr4-3200-memory-hx432c16pb3ak216">
                  Kingston HyperX Predator RGB 16 GB (2 x 8 GB) DDR4-3200 CL16
                  Memory
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Storage</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/TwWfrH/samsung-970-evo-plus-500-gb-m2-2280-nvme-solid-state-drive-mz-v7s500bam">
                  Samsung 970 Evo Plus 500 GB M.2-2280 NVME Solid State Drive
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Storage</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/Zxw7YJ/samsung-970-evo-plus-1-tb-m2-2280-nvme-solid-state-drive-mz-v7s1t0bam">
                  Samsung 970 Evo Plus 1 TB M.2-2280 NVME Solid State Drive
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Video Card</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/WGLwrH/sapphire-radeon-rx-5700-xt-8-gb-nitro-video-card-11293-03-40g">
                  Sapphire Radeon RX 5700 XT 8 GB NITRO+ Video Card
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Case</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/6Cyqqs/nzxt-h510-atx-mid-tower-case-ca-h510b-w1">
                  NZXT H510 ATX Mid Tower Case
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Power Supply</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/VgQG3C/corsair-rmx-2018-850w-80-gold-certified-fully-modular-atx-power-supply-cp-9020180-na">
                  Corsair RMx (2018) 850 W 80+ Gold Certified Fully Modular ATX
                  Power Supply
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Wireless Network Adapter</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/BJ97YJ/fenvi-fv-t919-none-wi-fi-adapter-fv-t919">
                  fenvi FV-T919 PCIe x1 802.11a/b/g/n/ac Wi-Fi Adapter
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Monitor</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/yCc48d/samsung-lc43j890dknxza-430-3840x1200-120hz-monitor-lc43j890dknxza">
                  Samsung LC43J890DKNXZA 43.0" 3840x1200 120 Hz Monitor
                </a>
              </td>
            </tr>
            <tr>
              <td class="pcpp-part-list-type">Mouse</td>
              <td class="pcpp-part-list-item">
                <a href="https://pcpartpicker.com/product/6qwkcf/glorious-pc-gaming-race-model-d-wired-optical-mouse-gd-white">
                  Glorious PC Gaming Race MODEL D Wired Optical Mouse
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <img
          src="/images/desk.jpg"
          alt="Battle station"
          className="deskSetup"
        />
      </div>
      <style jsx>
        {`
          .list {
            padding-left: 0px;
            margin: 0px;
            list-style-type: disc;
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
