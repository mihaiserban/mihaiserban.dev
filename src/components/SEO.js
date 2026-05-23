import { StaticQuery, graphql } from "gatsby";

import Helmet from "react-helmet";
import React from "react";

const Head = (props) => {
  const {
    data: {
      dataJson: {
        name,
        email,
        twitter,
        linkedIn,
        github,
        stackoverflow,
        instagram,
        goodreads,
        image: imageObj,
        siteTitle,
        siteTitleAlt,
        siteTitleShort,
        siteHeadline,
        siteUrl,
        siteLanguage,
        siteDescription,
        author,
        ogSiteName,
        ogLanguage,
        userTwitter,
        siteLogo,
      },
      allTechnologiesJson: { nodes: technologies },
      site: { buildTime },
    },
    title,
    description,
  } = props;

  const aTitle = title || siteTitle;
  const aDescription = description || siteDescription;
  const image = imageObj;
  const keywords = technologies.map((t) => t.title).join(", ");

  const schemaOrgWebPage = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: siteUrl,
    headline: siteHeadline,
    inLanguage: "en",
    mainEntityOfPage: siteUrl,
    description: siteDescription,
    name: siteTitle,
    author: {
      "@type": "Person",
      name: author,
    },
    copyrightHolder: {
      "@type": "Person",
      name: author,
    },
    copyrightYear: new Date().getFullYear(),
    creator: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Person",
      name: author,
    },
    datePublished: "2019-01-17",
    dateModified: buildTime,
    image: {
      "@type": "ImageObject",
      url: image,
    },
  };

  const itemListElement = [
    {
      "@type": "ListItem",
      item: {
        "@id": `${siteUrl}`,
        name: "Blog",
      },
      position: 1,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${siteUrl}/about`,
        name: "About me",
      },
      position: 2,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${siteUrl}/bookshelf`,
        name: "Bookshelf",
      },
      position: 3,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${siteUrl}/projects`,
        name: "Projects",
      },
      position: 4,
    },
  ];

  const breadcrumb = {
    "@context": "http://schema.org",
    "@type": "BreadcrumbList",
    description: "Breadcrumbs list",
    name: "Breadcrumbs",
    itemListElement,
  };

  return (
    <Helmet>
      <html lang={siteLanguage} />
      <title>{aTitle}</title>
      <link
        rel="apple-touch-icon"
        sizes="57x57"
        href="/favicons//apple-icon-57x57.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/favicons//apple-icon-60x60.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="72x72"
        href="/favicons//apple-icon-72x72.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/favicons//apple-icon-76x76.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/favicons//apple-icon-114x114.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/favicons//apple-icon-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/favicons//apple-icon-144x144.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/favicons//apple-icon-152x152.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicons//apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/favicons//android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicons//favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicons//favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicons//favicon-16x16.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta
        name="msapplication-TileImage"
        content="/favicons//ms-icon-144x144.png"
      />
      <meta name="theme-color" content="#ffffff" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="msapplication-config" content="browserconfig.xml" />

      <meta name="Mihai Serban" content="mihaiserban.dev" />
      <meta name="description" content={aDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="image" content={image} />
      <meta property="og:locale" content={ogLanguage} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:title" content={aTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={aDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={aDescription} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:creator"
        content={userTwitter ? userTwitter : ""}
      />
      <meta name="twitter:title" content={aTitle} />
      <meta name="twitter:description" content={aDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={aDescription} />
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgWebPage)}
      </script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
    </Helmet>
  );
};

const SEO = (props) => (
  <StaticQuery
    query={querySEO}
    render={(data) => <Head {...props} data={data} />}
  />
);

export default SEO;

const querySEO = graphql`
  query SEOQuery {
    dataJson {
      name
      email
      twitter
      linkedIn
      github
      stackoverflow
      instagram
      goodreads
      image
      siteTitle
      siteTitleAlt
      siteTitleShort
      siteHeadline
      siteUrl
      siteLanguage
      siteDescription
      author
      ogSiteName
      ogLanguage
      userTwitter
      siteLogo
    }
    allTechnologiesJson {
      nodes {
        title
      }
    }
    site {
      buildTime(formatString: "YYYY-MM-DD")
    }
  }
`;
