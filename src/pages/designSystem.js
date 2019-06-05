import React from 'react';
import { Link as glink, graphql } from 'gatsby';

import Link from '../components/link';
import Layout from '../components/layout';

import { H1, H2, H3, H4, H5 } from '../components/text/headings';

const Page = () => (
  <Layout>
    <div className="flex-parent flex-parent--column container">
      <H1>Design System</H1>
      <div className="mt16">
        <H2>Headings</H2>

        <H1>H1 - 1.8rem</H1>
        <H2>H2 - 1.625rem</H2>
        <H3>H3 - 1.4rem</H3>
        <H4>H4 - 1.15rem</H4>
        <H5>H5 - 1rem</H5>
      </div>
    </div>
    <style jsx>
      {`
        .container {
          min-width: 100%;
        }
      `}
    </style>
  </Layout>
);

export default Page;
