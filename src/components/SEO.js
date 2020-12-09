import React from "react";
import Helmet from "react-helmet";
import { graphql, StaticQuery } from "gatsby";

const Head = (props) => {
  const {
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
        image: imageObj,
      },
      contentfulSite,
      site: { buildTime },
    },
    title,
    description,
  } = props;

  const aTitle = title || contentfulSite.siteTitle;
  const aDescription = description || contentfulSite.siteDescription;
  const image = imageObj.file.url;

  // schema.org in JSONLD format
  // https://developers.google.com/search/docs/guides/intro-structured-data
  // You can fill out the 'author', 'creator' with more data or another type (e.g. 'Organization')

  const schemaOrgWebPage = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: contentfulSite.siteUrl,
    headline: contentfulSite.siteHeadline,
    inLanguage: "en",
    mainEntityOfPage: contentfulSite.siteUrl,
    description: contentfulSite.siteDescription,
    name: contentfulSite.siteTitle,
    author: {
      "@type": "Person",
      name: contentfulSite.author,
    },
    copyrightHolder: {
      "@type": "Person",
      name: contentfulSite.author,
    },
    copyrightYear: new Date().getFullYear(),
    creator: {
      "@type": "Person",
      name: contentfulSite.author,
    },
    publisher: {
      "@type": "Person",
      name: contentfulSite.author,
    },
    datePublished: "2019-01-17",
    dateModified: buildTime,
    image: {
      "@type": "ImageObject",
      url: image,
    },
  };

  // Initial breadcrumb list

  const itemListElement = [
    {
      "@type": "ListItem",
      item: {
        "@id": `${contentfulSite.siteUrl}`,
        name: "Blog",
      },
      position: 1,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${contentfulSite.siteUrl}/about`,
        name: "About me",
      },
      position: 2,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${contentfulSite.siteUrl}/bookshelf`,
        name: "Bookshelf",
      },
      position: 3,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${contentfulSite.siteUrl}/projects`,
        name: "Projects",
      },
      position: 4,
    },
    {
      "@type": "ListItem",
      item: {
        "@id": `${contentfulSite.siteUrl}/uses`,
        name: "Uses",
      },
      position: 5,
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
      <html lang={contentfulSite.siteLanguage} />
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
      <meta name="image" content={image} />
      <meta property="og:locale" content={contentfulSite.ogLanguage} />
      <meta property="og:site_name" content={contentfulSite.ogSiteName} />
      <meta property="og:title" content={aTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={aDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={aDescription} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:creator"
        content={contentfulSite.userTwitter ? contentfulSite.userTwitter : ""}
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
  query About {
    contentfulAbout {
      name
      email
      twitter
      linkedIn
      github
      stackoverflow
      instagram
      goodreads
      image {
        file {
          url
          fileName
          contentType
        }
      }
    }
    contentfulSite {
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
      siteLogo {
        file {
          url
          fileName
          contentType
        }
      }
    }
    site {
      buildTime(formatString: "YYYY-MM-DD")
    }
  }
`;
