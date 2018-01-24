module.exports = {
  siteMetadata: {
    author: 'Jon Leopard',
    title: `Jon Leopard | Web Developer`,
    siteUrl: 'https://jonleopard.com',
    defaultTitle: 'Jon Leopard | Web Developer',
    defaultDescription:
      'Jon Leopard is a Javascript Web Developer with skills in both Front-end and Back-end technologies.'
  },

  // mapping: {
  //   'MarkdownRemark.frontmatter.author': 'AuthorsYaml'
  // },
  plugins: [
    // Adding various source folders to the GraphQL layer.
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images/`
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: ``
      }
    },
    'gatsby-transformer-remark',
    'gatsby-transformer-json',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-offline',
    'gatsby-plugin-react-next',
    'gatsby-plugin-styled-components'
  ]
};
