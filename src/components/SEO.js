import { StaticQuery, graphql } from "gatsby";

import Helmet from "react-helmet";
import React from "react";

const isBrowser = () => typeof window !== "undefined";

const stripTrailingSlash = (str) =>
  str.endsWith("/") && str !== "/" ? str.slice(0, -1) : str;

const Head = (props) => {
  const {
    data: {
      about: {
        frontmatter: {
          name,
          email,
          twitter,
          linkedIn,
          github,
          stackoverflow,
          instagram,
          goodreads,
          image: imageObj,
        },
      },
      siteMeta: {
        siteTitle,
        siteHeadline,
        siteUrl,
        siteLanguage,
        siteDescription,
        author,
        ogSiteName,
        ogLanguage,
        userTwitter,
      },
      allTechnologiesJson: { nodes: technologies },
      buildInfo: { buildTime },
    },
    title,
    description,
    ogType,
    publishedDate,
    tags,
    image,
    pathname,
    canonicalUrl,
  } = props;

  const aTitle = title || siteTitle;
  const aDescription = description || siteDescription;
  const aImage = image || imageObj;
  const aOgType = ogType || "website";
  const aKeywords = tags
    ? tags.join(", ")
    : technologies.map((t) => t.title).join(", ");

  const pagePath = pathname || (isBrowser() ? window.location.pathname : "/");
  const aCanonicalUrl = canonicalUrl
    ? `${stripTrailingSlash(siteUrl)}${canonicalUrl}`
    : `${stripTrailingSlash(siteUrl)}${pagePath}`;

  const twitterHandle = userTwitter
    ? userTwitter.startsWith("@")
      ? userTwitter
      : `@${userTwitter}`
    : "";

  // Schema.org structured data
  const jsonLd = [];

  // BreadcrumbList
  const itemListElement = [
    {
      "@type": "ListItem",
      item: { "@id": siteUrl, name: "Blog" },
      position: 1,
    },
    {
      "@type": "ListItem",
      item: { "@id": `${siteUrl}/about`, name: "About me" },
      position: 2,
    },
    {
      "@type": "ListItem",
      item: { "@id": `${siteUrl}/bookshelf`, name: "Bookshelf" },
      position: 3,
    },
    {
      "@type": "ListItem",
      item: { "@id": `${siteUrl}/projects`, name: "Projects" },
      position: 4,
    },
  ];

  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    description: "Breadcrumbs list",
    name: "Breadcrumbs",
    itemListElement,
  });

  // Article or WebPage schema
  if (aOgType === "article") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      url: aCanonicalUrl,
      headline: aTitle,
      description: aDescription,
      datePublished: publishedDate || buildTime,
      dateModified: buildTime,
      author: {
        "@type": "Person",
        name: author,
        url: siteUrl,
      },
      publisher: {
        "@type": "Person",
        name: author,
      },
      image: {
        "@type": "ImageObject",
        url: aImage,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": aCanonicalUrl,
      },
    });
  } else {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: aCanonicalUrl,
      headline: siteHeadline,
      inLanguage: "en",
      mainEntityOfPage: aCanonicalUrl,
      description: aDescription,
      name: aTitle,
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
        url: aImage,
      },
    });
  }

  return (
    <Helmet>
      <html lang={siteLanguage} />
      <title>{aTitle}</title>

      {/* Canonical URL */}
      <link rel="canonical" href={aCanonicalUrl} />

      {/* Favicons */}
      <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="msapplication-config" content="browserconfig.xml" />

      {/* Standard meta */}
      <meta name="description" content={aDescription} />
      <meta name="keywords" content={aKeywords} />
      <meta name="author" content={author} />
      <meta name="image" content={aImage} />

      {/* Open Graph */}
      <meta property="og:locale" content={ogLanguage} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:url" content={aCanonicalUrl} />
      <meta property="og:title" content={aTitle} />
      <meta property="og:type" content={aOgType} />
      <meta property="og:description" content={aDescription} />
      <meta property="og:image" content={aImage} />
      <meta property="og:image:alt" content={aDescription} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Article-specific Open Graph */}
      {aOgType === "article" && publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {aOgType === "article" && (
        <>
          <meta property="article:author" content={author} />
          {aKeywords && (
            <meta property="article:tag" content={aKeywords} />
          )}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterHandle && (
        <meta name="twitter:creator" content={twitterHandle} />
      )}
      {twitterHandle && (
        <meta name="twitter:site" content={twitterHandle} />
      )}
      <meta name="twitter:title" content={aTitle} />
      <meta name="twitter:description" content={aDescription} />
      <meta name="twitter:image" content={aImage} />
      <meta name="twitter:image:alt" content={aDescription} />

      {/* JSON-LD structured data */}
      {jsonLd.map((ld, i) => (
        <script key={`ld-${i}`} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
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
    about: markdownRemark(fileAbsolutePath: { regex: "/content/about/bio.md/" }) {
      frontmatter {
        name
        email
        twitter
        linkedIn
        github
        stackoverflow
        instagram
        goodreads
        image
      }
    }
    siteMeta: dataJson(jsonName: { eq: "site" }) {
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
    }
    allTechnologiesJson {
      nodes {
        title
      }
    }
    buildInfo: site {
      buildTime(formatString: "YYYY-MM-DD")
    }
  }
`;
