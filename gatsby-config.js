module.exports = {
  pathPrefix: `/`,
  siteMetadata: {
    author: 'Jon Leopard',
    title: `Jon Leopard | Web Developer`,
    siteUrl: 'https://jonleopard.com',
    defaultTitle: 'Jon Leopard | Web Developer',
    defaultDescription:
      'Jon Leopard is a Javascript Web Developer with skills in both Front-end and Back-end technologies.',
  },

  plugins: [
    'gatsby-plugin-styled-components',
    'gatsby-plugin-react-next',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-88655191-1',
      },
    },
    'gatsby-plugin-react-helmet',
  ],
};
