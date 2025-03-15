import React from "react";
import { Link as glink, graphql } from "gatsby";

import Link from "../components/link";
import Layout from "../components/layout";
import "../styles/scss/pages/designSystem.scss";

const Page = () => (
  <Layout>
    <div className="flex flex-col container">
      <h1>Design System</h1>
      <div className="mt-4">
        <h2>Headings</h2>

        <h1>H1</h1>
        <h2>H2</h2>
        <h3>H3</h3>
        <h4>H4</h4>
        <h5>H5</h5>
      </div>
      <div className="mt-4">
        <h2>Other</h2>

        <p>paragraph</p>
      </div>
    </div>
  </Layout>
);

export default Page;
